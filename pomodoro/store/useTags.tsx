// store/useTagsStore.ts
import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

interface Tag {
  id: string;
  name: string;
  color: string;
}

interface StickyNote {
  id: string;
  content: string;
  tagIds?: string[];
  // ... other note properties
}

interface TagsStore {
  tags: Tag[];
  isLoading: boolean;
  
  // Actions
  loadTags: () => Promise<void>;
  createTag: (name: string, color?: string) => Promise<Tag>;
  deleteTag: (tagId: string) => Promise<void>;
  updateTag: (tagId: string, updates: Partial<Tag>) => Promise<void>;
  
  // Note-Tag associations
  addTagToNote: (noteId: string, tagId: string) => Promise<void>;
  removeTagFromNote: (noteId: string, tagId: string) => Promise<void>;
  getTagsForNote: (tagIds: string[]) => Tag[];
}

export const useTagsStore = create<TagsStore>((set, get) => ({
  tags: [],
  isLoading: false,

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
    
    if (user) {
      const { error } = await supabase
        .from('note_tags')
        .insert({ note_id: noteId, tag_id: tagId });
      if (error) throw error;
    } else {
      // For guest users, update the note's tagIds in localStorage
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

  getTagsForNote: (tagIds: string[]) => {
    const allTags = get().tags;
    return allTags.filter(tag => tagIds.includes(tag.id));
  },
}));