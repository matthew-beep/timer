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

  // Dirty tracking
  dirtyNoteIds: Set<string>;
  pendingDeletes: Set<string>;

  // Local actions (optimistic updates)
  addNote: (note: StickyNote) => Promise<void>;
  updateNote: (id: string, updates: Partial<StickyNote>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  setActiveNote: (id: string) => void;
  noteWidth: number;
  noteHeight: number;
  bringNoteToFront: (id: string, z: number) => void;
  activeNoteId?: string;
  viewMode: "list" | "grid";
  updateViewMode: (mode: "list" | "grid") => void;

  // Supabase sync actions
  loadFromSupabase: () => Promise<void>;
  syncToSupabase: () => Promise<void>;
  retrySync: () => Promise<void>;
  queueSync: () => void;
  initialize: () => Promise<void>;

  // Merge flow
  mergeState: 'idle' | 'prompt';
  guestNotes: StickyNote[];
  handleSignIn: () => Promise<void>;
  confirmMerge: () => Promise<void>;
  discardMerge: () => Promise<void>;
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
      dirtyNoteIds: new Set(),
      pendingDeletes: new Set(),
      mergeState: 'idle',
      guestNotes: [],
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
            dirtyNoteIds: new Set(), // Clear dirty flags on fresh load
            pendingDeletes: new Set(),
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

        const { dirtyNoteIds } = get();
        if (dirtyNoteIds.size === 0) return;

        console.log(`Queueing sync for ${dirtyNoteIds.size} dirty notes...`);

        // Clear existing timeout
        if (syncTimeout) {
          clearTimeout(syncTimeout);
        }

        // Queue sync after debounce delay
        syncTimeout = setTimeout(() => {
          get().syncToSupabase();
        }, SYNC_DEBOUNCE_MS);
      },

      retrySync: async () => {
        const { dirtyNoteIds, syncState } = get();

        if (syncState === 'syncing') {
          console.log('Sync already in progress');
          return;
        }

        if (dirtyNoteIds.size === 0) {
          console.log('No dirty notes to retry');
          return;
        }

        console.log(`Retrying sync for ${dirtyNoteIds.size} notes...`);
        await get().syncToSupabase();
      },

      syncToSupabase: async () => {
        const user = getAuthUser();
        if (!user) {
          console.log('No user, skipping Supabase sync');
          return;
        }

        const { notes, dirtyNoteIds } = get();

        // 1. Identify dirty notes
        const dirtyNotes = notes.filter(note => dirtyNoteIds.has(note.id));

        if (dirtyNotes.length === 0) {
          console.log('No dirty notes to sync');
          return;
        }

        console.log(`starting sync: idle -> syncing (${dirtyNotes.length} notes)`);
        set({ syncState: 'syncing' });

        try {
          // 2. Transform ONLY dirty notes
          const supabaseNotes = dirtyNotes.map(note =>
            transformToSupabaseNote(note, user.id)
          );

          // 3. Batch upsert
          const { error } = await supabase
            .from('sticky_notes')
            .upsert(supabaseNotes, {
              onConflict: 'id',
            });

          if (error) {
            console.error('Error syncing notes:', error);
            console.log(`sync failed: syncing -> error`);
            set({ syncState: 'error' });
            return;
          }

          console.log(`✅ Synced ${dirtyNotes.length} dirty notes to Supabase`);
          console.log(`sync complete: syncing -> idle`);

          // 4. Clear dirty flags on success
          set({
            syncState: 'idle',
            lastSyncedAt: new Date(),
            dirtyNoteIds: new Set(), // Clear dirty set
          });
        } catch (error) {
          console.error('Failed to sync notes to Supabase:', error);
          console.log(`sync failed: syncing -> error`);
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
          dirtyNoteIds: new Set([...state.dirtyNoteIds, newNote.id]),
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
          dirtyNoteIds: new Set([...state.dirtyNoteIds, id]),
        }));

        // Queue sync if authenticated
        get().queueSync();
      },

      deleteNote: async (id) => {
        const user = getAuthUser();

        // Optimistic update
        set((state) => ({
          notes: state.notes.filter((note) => note.id !== id),
          // Remove from dirty notes if present
          dirtyNoteIds: new Set([...state.dirtyNoteIds].filter(nid => nid !== id)),
          // Add to pending deletes
          pendingDeletes: new Set([...state.pendingDeletes, id]),
        }));

        // If authenticated, delete from Supabase IMMEDIATE (no debounce)
        if (user) {
          console.log(`Deleting note ${id} immediately...`);
          try {
            const { error } = await supabase
              .from('sticky_notes')
              .delete()
              .eq('id', id)
              .eq('user_id', user.id);
            if (error) {
              console.error('Error deleting note from Supabase:', error);
              // Note: We could restore if needed, but for now we log error
            } else {
              console.log('Deleted note from Supabase');
              // Clear from pending deletes
              set({ syncState: 'idle' })
              set((state) => ({
                pendingDeletes: new Set([...state.pendingDeletes].filter(pid => pid !== id))
              }));
            }
          } catch (error) {
            console.error('Failed to delete note from Supabase:', error);
          }
        }
      },

      handleSignIn: async () => {
        const { notes } = get();
        // If there are local notes, pause and prompt

        //TODO: issue is that every tab switch i see that signed in even fires and calls this
        // need to make sure that this is not called every time
        // differentiate from guest notes and logged in notes
        if (notes.length > 0) {
          console.log("notes: ", notes);
          console.log(`Found ${notes.length} guest notes. Prompting for merge.`);
          set({
            guestNotes: notes,
            mergeState: 'prompt',
            // Temporarily clear notes from UI until decision is made (optional, 
            // but often better to show them OR show empty state. 
            // Let's keep them visible or clear them? 
            // Actually, if we clear them, the background might look empty behind the modal.
            // Let's keep them in 'notes' for now but disable editing?
            // Or simpler: Clear 'notes' so we don't accidentally sync them if we weren't careful.
            // Safest: Copy to guestNotes, clear notes, show modal.
            notes: [],
          });
        } else {
          // No local notes, just load normally
          await get().loadFromSupabase();
        }
      },

      confirmMerge: async () => {
        const user = getAuthUser();
        const { guestNotes } = get();

        if (!user || guestNotes.length === 0) {
          set({ mergeState: 'idle', guestNotes: [] });
          return;
        }

        console.log(`Merging ${guestNotes.length} guest notes to Supabase...`);
        set({ syncState: 'syncing' });

        try {
          // 1. Transform guest notes to Supabase format with NEW user_id
          // We assume IDs are UUIDs. We can keep them or regenerate them. 
          // Keeping them is fine unless collisions happen (unlikely).
          const supabaseNotes = guestNotes.map(note =>
            transformToSupabaseNote(note, user.id)
          );

          // 2. Insert (using Upsert to be safe)
          const { error } = await supabase
            .from('sticky_notes')
            .upsert(supabaseNotes, { onConflict: 'id' });

          if (error) throw error;

          console.log('Merge successful. Loading combined notes...');

          // 3. Clear guest state
          set({ guestNotes: [], mergeState: 'idle' });

          // 4. Load everything from Supabase (combines old remote + new merged)
          await get().loadFromSupabase();

        } catch (error) {
          console.error('Merge failed:', error);
          set({ syncState: 'error' });
          // Optional: Keep mergeState='prompt' to allow retry?
          // For now, let's reset to avoid stuck state, but maybe log it.
          // Or better: Restore guest notes to 'notes' so user doesn't lose them?
          console.log('Restoring guest notes locally due to error.');
          set({ notes: guestNotes, mergeState: 'idle', syncState: 'error' });
        }
      },

      discardMerge: async () => {
        console.log('Discarding guest notes.');
        set({ guestNotes: [], mergeState: 'idle' });
        await get().loadFromSupabase();
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
            ),
            dirtyNoteIds: new Set([...state.dirtyNoteIds, id]),
          };
        });

        // Queue sync if authenticated
        get().queueSync();
      },
    }),

    {
      name: "sticky-notes",
      partialize: (state) => {
        const user = getAuthUser();

        // If authenticated, don't persist notes (Supabase is source of truth)
        if (user) {
          return {
            notes: [],
            noteWidth: state.noteWidth,
            noteHeight: state.noteHeight,
            viewMode: state.viewMode,
            // Don't persist dirty/pending/mergeState
          };
        }

        // If guest, persist everything EXCEPT dirty/pending (local only)
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

