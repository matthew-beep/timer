// store/useTagsStore.ts
import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { StickyNote } from './useNotes';

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
  syncTags: (newTags: Tag[]) => void;
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

export const useTagsStore = create<TagsStore>((set, get) => ({
  tags: [],
  isLoading: false,

  pendingOps: new Map<string, PendingTagOperation>(),

  // ADD THIS METHOD - allows notes store to populate tags after fetch
  setTags: (tags: Tag[]) => {
    set({ tags });
  },
  // Inside implementation
  syncTags: (newTags: Tag[]) => {
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
    const isGuest = !localStorage.getItem('supabase.auth.token'); // Or your auth check
    if (isGuest) {
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
        set({ isLoading: false });
      }
    } else {
      // Load from localStorage for guest users
      const stored = localStorage.getItem('sticky-tags');
      const tags: Tag[] = stored ? JSON.parse(stored) : [];
      set({ tags });
    }
  },

  createTag: async (name: string, color = '#6b7280') => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Create in Supabase
      const { data, error } = await supabase
        .from('tags')
        .insert({ user_id: user.id, name: name.trim(), color })
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
        color,
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

    const { data: { user } } = await supabase.auth.getUser();
    const { pendingOps } = get();


    let ops = pendingOps.get(noteId) || {
      noteId,
      toAdd: new Set(),
      toRemove: new Set()
    };

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
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { error } = await supabase
        .from('note_tags')
        .delete()
        .eq('note_id', noteId)
        .eq('tag_id', tagId);
      if (error) throw error;
    } else {
      // For guest users, update the note's tagIds in localStorage
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
  },

    // Execute the batched operations
  flushTagOperations: async (noteId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return; // Guest operations are already in localStorage

    const { pendingOps } = get();
    const ops = pendingOps.get(noteId);
    
    if (!ops || (ops.toAdd.size === 0 && ops.toRemove.size === 0)) {
      return;
    }

    console.log(`Flushing tag operations for note ${noteId}:`, {
      toAdd: Array.from(ops.toAdd),
      toRemove: Array.from(ops.toRemove)
    });

    try {
      // Batch delete
      if (ops.toRemove.size > 0) {
        const { error: deleteError } = await supabase
          .from('note_tags')
          .delete()
          .eq('note_id', noteId)
          .in('tag_id', Array.from(ops.toRemove));

        if (deleteError) throw deleteError;
      }

      // Batch insert
      if (ops.toAdd.size > 0) {
        const inserts = Array.from(ops.toAdd).map(tagId => ({
          note_id: noteId,
          tag_id: tagId
        }));

        const { error: insertError } = await supabase
          .from('note_tags')
          .upsert(inserts, { onConflict: 'note_id,tag_id' });

        if (insertError) throw insertError;
      }

      // Clear this note's pending ops
      pendingOps.delete(noteId);
      set({ pendingOps: new Map(pendingOps) });
      
      console.log(`✅ Synced tag operations for note ${noteId}`);
    } catch (error) {
      console.error('Failed to flush tag operations:', error);
      // Keep operations in queue for retry
      // Could implement retry logic here
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