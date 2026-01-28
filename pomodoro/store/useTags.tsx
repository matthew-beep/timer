// store/useTagsStore.ts
import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { StickyNote, useNotesStore } from './useNotes';

interface Tag {
  id: string;
  name: string;
  color: string;
}

interface PendingTagOperation {
  noteId: string;
  toAdd: Set<string>;    // Tag IDs to add
  toRemove: Set<string>; // Tag IDs to remove
}

interface TagsStore {
  tags: Tag[];
  isLoading: boolean;

  pendingOps: Map<string, PendingTagOperation>; // Per-note operations

  // Actions
  setTags: (tags: Tag[]) => void; // ADD THIS - allows external setting of tags
  loadTags: () => Promise<void>;
  createTag: (name: string, color?: string) => Promise<Tag>;
  deleteTag: (tagId: string) => Promise<void>;
  updateTag: (tagId: string, updates: Partial<Tag>) => Promise<void>;
  syncTags: (newTags: Tag[]) => Promise<void>;
  clearTags: () => void;

  // Note-Tag associations
  addTagToNote: (noteId: string, tagId: string) => Promise<void>;
  removeTagFromNote: (noteId: string, tagId: string) => Promise<void>;
  getTagsForNote: (tagIds: string[]) => Tag[];

  flushTagOperations: (noteId: string) => Promise<void>;

}

// Debounce timers per note
const tagOperationTimers = new Map<string, ReturnType<typeof setTimeout>>();
const TAG_OPERATION_DEBOUNCE_MS = 500;

// Color palette for tags
const TAG_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#f59e0b', // amber
  '#eab308', // yellow
  '#84cc16', // lime
  '#22c55e', // green
  '#10b981', // emerald
  '#14b8a6', // teal
  '#06b6d4', // cyan
  '#0ea5e9', // sky
  '#3b82f6', // blue
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#a855f7', // purple
  '#d946ef', // fuchsia
  '#ec4899', // pink
  '#f43f5e', // rose
];

const getRandomTagColor = () => {
  return TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)];
};

export const useTagsStore = create<TagsStore>((set, get) => ({
  tags: [],
  isLoading: false,

  pendingOps: new Map<string, PendingTagOperation>(),

  // ADD THIS METHOD - allows notes store to populate tags after fetch
  setTags: (tags: Tag[]) => {
    set({ tags });
  },
  // Inside implementation
  syncTags: async (newTags: Tag[]) => {
    const currentTags = get().tags;
    const tagMap = new Map();

    // Add existing tags to map
    currentTags.forEach(t => tagMap.set(t.id, t));

    // Add/Update with new tags fetched from the join
    newTags.forEach(t => tagMap.set(t.id, t));

    const mergedTags = Array.from(tagMap.values());
    set({ tags: mergedTags });
    console.log("Synced tags:", mergedTags);

    // If guest, keep localStorage in sync
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      localStorage.setItem('sticky-tags', JSON.stringify(mergedTags));
    }
  },
  loadTags: async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      // Load from Supabase for logged-in users
      set({ isLoading: true });

      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (!error && data) {
        set({ tags: data, isLoading: false });
      } else {
        console.error('Failed to load tags from Supabase:', error);
        set({ isLoading: false });
      }
    } else {
      // Load from localStorage for guest users
      const stored = localStorage.getItem('sticky-tags');
      const tags: Tag[] = stored ? JSON.parse(stored) : [];
      set({ tags });
    }
  },

  createTag: async (name: string, color?: string) => {
    const tagColor = color || getRandomTagColor();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      // Create in Supabase
      const { data, error } = await supabase
        .from('tags')
        .insert({ user_id: user.id, name: name.trim(), color: tagColor })
        .select()
        .single();

      if (error) throw error;
      set((state) => ({ tags: [...state.tags, data] }));
      return data;
    } else {
      // Create in localStorage
      const newTag: Tag = {
        id: crypto.randomUUID(),
        name: name.trim(),
        color: tagColor,
      };

      const updatedTags = [...get().tags, newTag];
      set({ tags: updatedTags });
      localStorage.setItem('sticky-tags', JSON.stringify(updatedTags));
      return newTag;
    }
  },

  deleteTag: async (tagId: string) => {
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { error } = await supabase.from('tags').delete().eq('id', tagId);
      if (error) throw error;
    }

    // Update local state (for both logged-in and guest)
    const updatedTags = get().tags.filter(t => t.id !== tagId);
    set({ tags: updatedTags });

    // Remove tag from all notes in the notes store (for both logged-in and guest)
    const notesStore = useNotesStore.getState();
    notesStore.notes.forEach(note => {
      if (note.tagIds?.includes(tagId)) {
        notesStore.updateNote(note.id, {
          tagIds: note.tagIds.filter(id => id !== tagId)
        });
      }
    });

    // Clear any pending operations involving this tag
    const { pendingOps } = get();
    pendingOps.forEach((ops, noteId) => {
      ops.toAdd.delete(tagId);
      ops.toRemove.delete(tagId);

      // If no operations left for this note, remove the entry
      if (ops.toAdd.size === 0 && ops.toRemove.size === 0) {
        pendingOps.delete(noteId);
      }
    });
    set({ pendingOps: new Map(pendingOps) });

    if (!user) {
      localStorage.setItem('sticky-tags', JSON.stringify(updatedTags));

      // Also remove this tag from all notes in localStorage
      const storedNotes = localStorage.getItem('sticky-notes');
      if (storedNotes) {
        const notes: StickyNote[] = JSON.parse(storedNotes);
        const updatedNotes = notes.map((note) => ({
          ...note,
          tagIds: note.tagIds?.filter((id) => id !== tagId) || []
        }));
        localStorage.setItem('sticky-notes', JSON.stringify(updatedNotes));
      }
    }
  },

  updateTag: async (tagId: string, updates: Partial<Tag>) => {
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data, error } = await supabase
        .from('tags')
        .update(updates)
        .eq('id', tagId)
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        tags: state.tags.map(t => t.id === tagId ? data : t)
      }));
    } else {
      const updatedTags = get().tags.map(t =>
        t.id === tagId ? { ...t, ...updates } : t
      );
      set({ tags: updatedTags });
      localStorage.setItem('sticky-tags', JSON.stringify(updatedTags));
    }
  },

  addTagToNote: async (noteId: string, tagId: string) => {
    console.log("adding tag to note: ", noteId, tagId);
    const { data: { user } } = await supabase.auth.getUser();
    const { pendingOps } = get();


    let ops = pendingOps.get(noteId);

    if (!ops) {
      ops = { noteId, toAdd: new Set(), toRemove: new Set() };
      pendingOps.set(noteId, ops);
    }

    // If we were going to remove this tag, cancel that
    if (ops.toRemove.has(tagId)) {
      ops.toRemove.delete(tagId);
    } else {
      // Otherwise, queue it for addition
      ops.toAdd.add(tagId);
    }

    set({ pendingOps: new Map(pendingOps) });

    // Optimistically update the note's tagIds in the notes store
    const notesStore = useNotesStore.getState();
    const currentNote = notesStore.notes.find(n => n.id === noteId);
    if (currentNote) {
      const currentTagIds = currentNote.tagIds || [];
      if (!currentTagIds.includes(tagId)) {
        notesStore.updateNote(noteId, {
          tagIds: [...currentTagIds, tagId]
        });
      }
    }

    // Optimistically update localStorage for guests immediately
    if (!user) {
      const storedNotes = localStorage.getItem('sticky-notes');
      if (storedNotes) {
        const notes: StickyNote[] = JSON.parse(storedNotes);
        const updatedNotes = notes.map((note) => {
          if (note.id === noteId) {
            const tagIds = note.tagIds || [];
            if (!tagIds.includes(tagId)) {
              return { ...note, tagIds: [...tagIds, tagId] };
            }
          }
          return note;
        });
        localStorage.setItem('sticky-notes', JSON.stringify(updatedNotes));
      }
    }

    // Debounce the actual sync
    if (tagOperationTimers.has(noteId)) {
      clearTimeout(tagOperationTimers.get(noteId)!);
    }

    const timer = setTimeout(() => {
      get().flushTagOperations(noteId);
    }, TAG_OPERATION_DEBOUNCE_MS);

    tagOperationTimers.set(noteId, timer);
  },

  removeTagFromNote: async (noteId: string, tagId: string) => {
    console.log("removing tag from note: ", noteId, tagId);
    const { data: { user } } = await supabase.auth.getUser();
    const { pendingOps } = get();

    // Get or create pending ops for this note
    let ops = pendingOps.get(noteId);

    if (!ops) {
      ops = { noteId, toAdd: new Set(), toRemove: new Set() };
      pendingOps.set(noteId, ops);
    }

    // If we were going to add this tag, cancel that
    if (ops.toAdd.has(tagId)) {
      ops.toAdd.delete(tagId);
    } else {
      // Otherwise, queue it for removal
      ops.toRemove.add(tagId);
    }

    set({ pendingOps: new Map(pendingOps) });

    // Optimistically update the note's tagIds in the notes store
    const notesStore = useNotesStore.getState();
    const currentNote = notesStore.notes.find(n => n.id === noteId);
    if (currentNote) {
      const currentTagIds = currentNote.tagIds || [];
      notesStore.updateNote(noteId, {
        tagIds: currentTagIds.filter(id => id !== tagId)
      });
    }

    // Optimistically update localStorage for guests immediately
    if (!user) {
      const storedNotes = localStorage.getItem('sticky-notes');
      if (storedNotes) {
        const notes: StickyNote[] = JSON.parse(storedNotes);
        const updatedNotes = notes.map((note) => {
          if (note.id === noteId) {
            return {
              ...note,
              tagIds: (note.tagIds || []).filter((id) => id !== tagId)
            };
          }
          return note;
        });
        localStorage.setItem('sticky-notes', JSON.stringify(updatedNotes));
      }
    }

    // Debounce the actual sync (reuse same timer as addTagToNote)
    if (tagOperationTimers.has(noteId)) {
      clearTimeout(tagOperationTimers.get(noteId)!);
    }

    const timer = setTimeout(() => {
      get().flushTagOperations(noteId);
    }, TAG_OPERATION_DEBOUNCE_MS);

    tagOperationTimers.set(noteId, timer);
  },

  // Execute the batched operations
  flushTagOperations: async (noteId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('⚠️ No user, skipping tag operations flush');
      return; // Guest operations are already in localStorage
    }

    const { pendingOps } = get();
    const ops = pendingOps.get(noteId);

    if (!ops || (ops.toAdd.size === 0 && ops.toRemove.size === 0)) {
      console.log(`⚠️ No operations to flush for note ${noteId}`);
      return;
    }

    // Remove any tags from toAdd that are also in toRemove (shouldn't happen, but be safe)
    const tagsToAdd = Array.from(ops.toAdd).filter(tagId => !ops.toRemove.has(tagId));
    const tagsToRemove = Array.from(ops.toRemove);

    console.log(`🔄 Flushing tag operations for note ${noteId}:`, {
      toAdd: tagsToAdd,
      toRemove: tagsToRemove,
      userId: user.id
    });

    try {
      // Batch delete first (remove tags)
      if (tagsToRemove.length > 0) {
        console.log(`🗑️ Deleting ${tagsToRemove.length} tag associations...`);
        const { data: deleteData, error: deleteError } = await supabase
          .from('note_tags')
          .delete()
          .eq('note_id', noteId)
          .in('tag_id', tagsToRemove)
          .select();

        if (deleteError) {
          console.error('❌ Delete error:', deleteError);
          throw deleteError;
        }
        console.log(`✅ Deleted ${deleteData?.length || 0} tag associations`);
      }

      // Batch insert (add tags) - use insert instead of upsert to avoid conflicts
      if (tagsToAdd.length > 0) {
        console.log(`➕ Inserting ${tagsToAdd.length} tag associations...`);
        const inserts = tagsToAdd.map(tagId => ({
          note_id: noteId,
          tag_id: tagId
        }));

        const { data: insertData, error: insertError } = await supabase
          .from('note_tags')
          .insert(inserts)
          .select();

        if (insertError) {
          console.error('❌ Insert error:', insertError);
          // If it's a unique constraint violation, the tag might already exist
          // This is okay - we can ignore it
          if (insertError.code === '23505') {
            console.log('⚠️ Some tags already exist (unique constraint), continuing...');
          } else {
            throw insertError;
          }
        } else {
          console.log(`✅ Inserted ${insertData?.length || 0} tag associations`);
        }
      }

      // Clear this note's pending ops only after successful sync
      pendingOps.delete(noteId);
      set({ pendingOps: new Map(pendingOps) });

      console.log(`✅ Successfully synced tag operations for note ${noteId}`);
    } catch (err: unknown) {
      console.error('❌ Failed to flush tag operations:', err);
      const error = err as { message?: string; code?: string; details?: string; hint?: string };
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      // Keep operations in queue for retry - don't clear them on error
      // TODO: Implement retry logic with exponential backoff
    }
  },

  getTagsForNote: (tagIds: string[]) => {
    const allTags = get().tags;
    return allTags.filter(tag => tagIds.includes(tag.id));
  },
  clearTags: () => {
    set({
      tags: [],
      pendingOps: new Map(),
      isLoading: false
    });

    // Clear any pending timers
    tagOperationTimers.forEach(timer => clearTimeout(timer));
    tagOperationTimers.clear();
  }
}));