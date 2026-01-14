import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "@/lib/supabase";
import type { CanvasPath } from "react-sketch-canvas";
import { JSONContent } from '@tiptap/core';

// Helper to get auth user without circular dependency
const getAuthUser = () => {
  if (typeof window === 'undefined') return null;
  // Dynamically import to avoid circular dependency
  const { useAuthStore } = require('./useAuth');
  return useAuthStore.getState().user;
};

export type StickyNote = {
  id: string;
  x: number;
  y: number;
  text: JSONContent;
  color: string;
  zIndex: number;
  width: number;
  height: number;
  mode?: "draw" | "text"
  paths?: CanvasPath[]; // for drawing paths
  inlineSvg?: string; // for storing SVG representation
  dateCreated: string;
  lastEdited: string;
};

type SyncState = 'idle' | 'syncing' | 'error';

type NotesStore = {
  notes: StickyNote[];
  syncState: SyncState;
  lastSyncedAt: Date | null;
  isInitialized: boolean;
  
  // Local actions (optimistic updates)
  addNote: (note: StickyNote) => Promise<void>;
  updateNote: (id: string, updates: Partial<StickyNote>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  setActiveNote: (id: string) => void;
  noteWidth: number;
  noteHeight: number;
  bringNoteToFront: (id: string, z:number) => void;
  activeNoteId?: string;
  viewMode: "list" | "grid";
  updateViewMode: (mode: "list" | "grid") => void;
  
  // Supabase sync actions
  loadFromSupabase: () => Promise<void>;
  syncToSupabase: () => Promise<void>;
  queueSync: () => void;
  initialize: () => Promise<void>;
};

// Debounce timeout for syncing (ms)
const SYNC_DEBOUNCE_MS = 500;
let syncTimeout: ReturnType<typeof setTimeout> | null = null;

// Transform Supabase row to app format
const transformSupabaseNote = (row: any): StickyNote => ({
  id: row.id,
  x: row.x,
  y: row.y,
  width: row.width,
  height: row.height,
  zIndex: row.z_index,
  text: row.text as JSONContent,
  color: row.color,
  mode: row.mode || 'text',
  paths: row.paths || [],
  inlineSvg: row.inline_svg || '',
  dateCreated: row.date_created,
  lastEdited: row.last_edited,
});

// Transform app note to Supabase format
const transformToSupabaseNote = (note: StickyNote, userId: string) => ({
  id: note.id,
  user_id: userId,
  x: note.x,
  y: note.y,
  width: note.width,
  height: note.height,
  z_index: note.zIndex,
  text: note.text,
  color: note.color,
  mode: note.mode || 'text',
  paths: note.paths || null,
  inline_svg: note.inlineSvg || null,
  date_created: note.dateCreated,
  last_edited: note.lastEdited,
});

export const useNotesStore = create<NotesStore>()(
  persist(
    (set, get) => ({
      notes: [],
      syncState: 'idle',
      lastSyncedAt: null,
      isInitialized: false,
      noteWidth: 300,
      noteHeight: 300,
      viewMode: "grid",
      
      updateViewMode: (mode) => set({ viewMode: mode }),
      setActiveNote: (id) => set({ activeNoteId: id }),

      initialize: async () => {
        const user = getAuthUser();
        
        if (user) {
          // User is authenticated - load from Supabase
          await get().loadFromSupabase();
        }
        // If not authenticated, notes will be loaded from localStorage via persist
        
        set({ isInitialized: true });
      },

      loadFromSupabase: async () => {
        const user = getAuthUser();
        if (!user) {
          console.log('No user, skipping Supabase load');
          return;
        }

        try {
          console.log('Loading notes from Supabase...');
          const { data, error } = await supabase
            .from('sticky_notes')
            .select('*')
            .eq('user_id', user.id)
            .order('last_edited', { ascending: false });

          if (error) {
            console.error('Error loading notes:', error);
            set({ syncState: 'error' });
            return;
          }

          const notes: StickyNote[] = (data || []).map(transformSupabaseNote);
          
          console.log(`Loaded ${notes.length} notes from Supabase`);
          set({ 
            notes,
            lastSyncedAt: new Date(),
            syncState: 'idle',
          });
        } catch (error) {
          console.error('Failed to load notes from Supabase:', error);
          set({ syncState: 'error' });
        }
      },

      queueSync: () => {
        const user = getAuthUser();
        if (!user) {
          // Not authenticated - don't sync
          return;
        }

        // Clear existing timeout
        if (syncTimeout) {
          clearTimeout(syncTimeout);
        }

        // Queue sync after debounce delay
        syncTimeout = setTimeout(() => {
          get().syncToSupabase();
        }, SYNC_DEBOUNCE_MS);
      },

      syncToSupabase: async () => {
        const user = getAuthUser();
        if (!user) {
          console.log('No user, skipping Supabase sync');
          return;
        }

        const { notes } = get();
        if (notes.length === 0) {
          return;
        }

        set({ syncState: 'syncing' });

        try {
          // Transform notes to Supabase format
          const supabaseNotes = notes.map(note => transformToSupabaseNote(note, user.id));

          // Upsert all notes (insert or update)
          const { error } = await supabase
            .from('sticky_notes')
            .upsert(supabaseNotes, {
              onConflict: 'id',
            });

          if (error) {
            console.error('Error syncing notes:', error);
            set({ syncState: 'error' });
            return;
          }

          console.log(`Synced ${notes.length} notes to Supabase`);
          set({ 
            syncState: 'idle',
            lastSyncedAt: new Date(),
          });
        } catch (error) {
          console.error('Failed to sync notes to Supabase:', error);
          set({ syncState: 'error' });
        }
      },

      addNote: async (note) => {
        const now = new Date().toISOString();
        const newNote: StickyNote = {
          ...note,
          dateCreated: note.dateCreated || now,
          lastEdited: note.lastEdited || now,
        };

        // Optimistic update
        set((state) => ({
          notes: [...state.notes, newNote],
        }));

        // Queue sync if authenticated
        get().queueSync();
      },

      updateNote: async (id, updates) => {
        // Optimistic update
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id
              ? {
                  ...note,
                  ...updates,
                  lastEdited: new Date().toISOString(),
                }
              : note
          ),
        }));

        // Queue sync if authenticated
        get().queueSync();
      },

      deleteNote: async (id) => {
        const user = getAuthUser();
        
        // Optimistic update
        set((state) => ({
          notes: state.notes.filter((note) => note.id !== id),
        }));

        // If authenticated, delete from Supabase immediately (no debounce for deletes)
        if (user) {
          try {
            const { error } = await supabase
              .from('sticky_notes')
              .delete()
              .eq('id', id)
              .eq('user_id', user.id);

            if (error) {
              console.error('Error deleting note from Supabase:', error);
              // Note: We could reload from Supabase here to restore the note
            } else {
              console.log('Deleted note from Supabase');
            }
          } catch (error) {
            console.error('Failed to delete note from Supabase:', error);
          }
        }
      },

      bringNoteToFront: (id: string, z: number) => {
        set((state) => {
          const notes = [...state.notes];
          const maxZIndex = Math.max(...notes.map(n => n.zIndex), 0);

          if (z >= maxZIndex) {
            return { notes };
          }

          return {
            notes: notes.map(note =>
              note.id === id
                ? { ...note, zIndex: maxZIndex + 1 }
                : note
            )
          };
        });

        // Queue sync if authenticated
        get().queueSync();
      },
    }),
    
    {
      name: "sticky-notes",
      // Only persist to localStorage if not authenticated (guest mode)
      partialize: (state) => {
        const user = getAuthUser();
        
        // If authenticated, don't persist to localStorage (Supabase is source of truth)
        if (user) {
          return {
            notes: [],
            noteWidth: state.noteWidth,
            noteHeight: state.noteHeight,
            viewMode: state.viewMode,
          };
        }
        
        // If guest, persist everything
        return {
          notes: state.notes,
          noteWidth: state.noteWidth,
          noteHeight: state.noteHeight,
          viewMode: state.viewMode,
        };
      },
    }
  )
);

