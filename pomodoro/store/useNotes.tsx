import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "@/lib/supabase";
import type { CanvasPath } from "react-sketch-canvas";
import { JSONContent } from '@tiptap/core';
import type { Tables } from "@/types/supabase";
import { getCurrentUser } from "@/lib/auth-helpers";
import { telemetry } from "@/lib/telemetry";

export type StickyNote = {
  id: string;
  x: number;
  y: number;
  text: JSONContent;
  plainText: string;
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

  // Retry logic
  retryCount: number;
  lastError: {
    message: string;
    code?: string;
    timestamp: Date;
    noteIds?: string[];
  } | null;

  // Local actions (optimistic updates)
  addNote: (note: StickyNote) => Promise<void>;
  updateNote: (id: string, updates: Partial<StickyNote>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  setActiveNote: (id: string) => void;
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
  hasLoadedFromSupabase: boolean;
  isFetchingFromSupabase: boolean; // Race guard

  // Merge flow
  mergeState: 'idle' | 'prompt';
  guestNotes: StickyNote[];
  handleSignIn: () => Promise<void>;
  confirmMerge: () => Promise<void>;
  discardMerge: () => Promise<void>;
};

// Error categorization
const isTransientError = (error: any): boolean => {
  if (!error) return false;

  const message = error.message?.toLowerCase() || '';
  const code = error.code || '';

  // Network errors
  if (message.includes('network') ||
    message.includes('timeout') ||
    message.includes('fetch')) {
    return true;
  }

  // Postgres connection errors
  if (code === 'PGRST301' || code === 'PGRST504') {
    return true;
  }

  // Rate limiting
  if (code === '429' || message.includes('rate limit')) {
    return true;
  }

  return false;
};
const MAX_RETRIES = 5;
const BASE_DELAY_MS = 1000;

// Debounce timeout for syncing (ms)
const SYNC_DEBOUNCE_MS = 500;
let syncTimeout: ReturnType<typeof setTimeout> | null = null;

export const DEFAULT_NOTE_WIDTH = 300;
export const DEFAULT_NOTE_HEIGHT = 300;

// Transform Supabase row to app format
const transformSupabaseNote = (row: Tables<'sticky_notes'>): StickyNote => ({
  id: row.id,
  x: row.x,
  y: row.y,
  width: row.width,
  height: row.height,
  zIndex: row.z_index,
  text: row.text as JSONContent,
  color: row.color,
  mode: (row.mode as "draw" | "text") || 'text',
  paths: (row.paths as unknown as CanvasPath[]) || [],
  inlineSvg: row.inline_svg || undefined,
  plainText: row.plain_text || '',
  dateCreated: row.date_created || new Date().toISOString(),
  lastEdited: row.last_edited || new Date().toISOString(),
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
  plain_text: note.plainText,
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
      retryCount: 0,
      lastError: null,
      lastSyncedAt: null,
      isInitialized: false,
      dirtyNoteIds: new Set(),
      pendingDeletes: new Set(),
      mergeState: 'idle',
      guestNotes: [],
      viewMode: "grid",
      hasLoadedFromSupabase: false,
      isFetchingFromSupabase: false,

      updateViewMode: (mode) => set({ viewMode: mode }),
      setActiveNote: (id) => set({ activeNoteId: id }),

      initialize: async () => {
        const user = getCurrentUser();

        if (user) {
          // User is authenticated - load from Supabase
          await get().loadFromSupabase();
        }
        // If not authenticated, notes will be loaded from localStorage via persist

        set({ isInitialized: true });
      },

      loadFromSupabase: async () => {
        const user = getCurrentUser();
        // 1. Check user
        if (!user) {
          console.log('No user, skipping Supabase load');
          return;
        }

        // 2. Conflict Guard: If we have local notes that haven't been synced/merged, handling them takes priority
        const { notes, hasLoadedFromSupabase, mergeState } = get();
        const hasGuestNotes = notes.length > 0 && !hasLoadedFromSupabase;

        if (hasGuestNotes) {
          console.log("Found guest notes during load attempt. Aborting load to prompt merge.");
          // If not already prompting, trigger the prompt logic
          if (mergeState === 'idle') {
            get().handleSignIn();
          }
          return;
        }

        // 2. Race guard check
        if (get().isFetchingFromSupabase) {
          console.log('⏭️  Fetch already in progress, skipping');
          return;
        }

        try {
          console.log('Loading notes from Supabase...');
          // 3. Set flag
          set({ isFetchingFromSupabase: true });

          const { data, error } = await supabase
            .from('sticky_notes')
            .select('*')
            .eq('user_id', user.id)
            .order('last_edited', { ascending: false });

          if (error) {
            console.error('Error loading notes:', error);
            // 4. Reset flag on error
            set({ syncState: 'error', isFetchingFromSupabase: false });
            return;
          }

          const notes: StickyNote[] = (data || []).map(transformSupabaseNote);

          console.log(`Loaded ${notes.length} notes from Supabase`);
          set({
            notes,
            hasLoadedFromSupabase: true,
            lastSyncedAt: new Date(),
            syncState: 'idle',
            dirtyNoteIds: new Set(), // Clear dirty flags on fresh load
            pendingDeletes: new Set(),
            isFetchingFromSupabase: false, // 4. Reset flag on success
          });
        } catch (error) {
          console.error('Failed to load notes from Supabase:', error);
          // 4. Reset flag on catch
          set({ syncState: 'error', isFetchingFromSupabase: false });
        }
      },

      queueSync: () => {
        const user = getCurrentUser();
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

      // sync to supabase on notes change
      // if no user, do nothing
      // if user and dirty notes, sync
      // on error -> check if network error, if so, retry

      // retry up to MAX_RETRIES with exponential backoff of BASE_DELAY_MS * 2^retryCount

      // if not network error, show error
      syncToSupabase: async () => {
        const timer = telemetry.startTimer('notes.sync');
        const user = getCurrentUser();
        if (!user) {
          telemetry.track('notes.sync.skipped', { reason: 'no_user' });
          console.log('No user, skipping Supabase sync');
          return;
        }

        const { notes, dirtyNoteIds, retryCount } = get();
        const dirtyNotes = notes.filter(note => dirtyNoteIds.has(note.id));
        if (dirtyNotes.length === 0) {
          telemetry.track('notes.sync.skipped', { reason: 'no_dirty_notes' });
          console.log('No dirty notes to sync');
          return;
        }

        telemetry.track('notes.sync.started', {
          noteCount: dirtyNotes.length,
          retryCount
        });
        console.log(`Starting sync: ${dirtyNotes.length} notes (attempt ${retryCount + 1})`);
        set({ syncState: 'syncing' });
        try {
          const supabaseNotes = dirtyNotes.map(note =>
            transformToSupabaseNote(note, user.id)
          );
          const { error } = await supabase
            .from('sticky_notes')
            .upsert(supabaseNotes, { onConflict: 'id' });
          if (error) {
            // Categorize error
            const isTransient = isTransientError(error);
            timer.end({ success: false, error: error.message });

            if (isTransient && retryCount < MAX_RETRIES) {
              // Schedule retry with exponential backoff
              const delay = BASE_DELAY_MS * Math.pow(2, retryCount);

              telemetry.track('notes.sync.retry', {
                noteCount: dirtyNotes.length,
                retryCount: retryCount + 1,
                delay,
                error: error.message,
                errorCode: error.code
              });
              console.log(`⏳ Retry ${retryCount + 1}/${MAX_RETRIES} in ${delay}ms`);

              set({
                syncState: 'error',
                retryCount: retryCount + 1,
                lastError: {
                  message: error.message,
                  code: error.code,
                  timestamp: new Date(),
                  noteIds: dirtyNotes.map(n => n.id)
                }
              });

              // Schedule retry
              setTimeout(() => {
                get().syncToSupabase();
              }, delay);

              return;
            }

            // Permanent error or max retries reached
            console.error('❌ Sync failed permanently:', error);

            telemetry.trackError(error as Error, {
              context: 'notes.sync',
              noteCount: dirtyNotes.length,
              retryCount,
              isTransient,
              errorCode: error.code
            });

            set({
              syncState: 'error',
              lastError: {
                message: error.message,
                code: error.code,
                timestamp: new Date(),
                noteIds: dirtyNotes.map(n => n.id)
              }
            });

            // TODO: Show user notification
            return;
          }
          // Success - reset retry count
          console.log(`✅ Synced ${dirtyNotes.length} notes`);

          timer.end({ success: true, noteCount: dirtyNotes.length });
          telemetry.track('notes.sync.success', {
            noteCount: dirtyNotes.length,
            retryCount
          });

          set({
            syncState: 'idle',
            lastSyncedAt: new Date(),
            dirtyNoteIds: new Set(),
            retryCount: 0,
            lastError: null
          });

        } catch (error: any) {
          const isTransient = isTransientError(error);
          timer.end({ success: false, error: error.message });

          if (isTransient && retryCount < MAX_RETRIES) {
            const delay = BASE_DELAY_MS * Math.pow(2, retryCount);
            console.log(`⏳ Retry ${retryCount + 1}/${MAX_RETRIES} in ${delay}ms`);

            telemetry.track('notes.sync.retry', {
              noteCount: dirtyNotes.length,
              retryCount: retryCount + 1,
              delay,
              error: error.message
            });

            set({
              syncState: 'error',
              retryCount: retryCount + 1,
              lastError: {
                message: error.message,
                timestamp: new Date(),
                noteIds: dirtyNotes.map(n => n.id)
              }
            });

            setTimeout(() => {
              get().syncToSupabase();
            }, delay);
          } else {
            console.error('❌ Sync failed permanently:', error);

            telemetry.trackError(error, {
              context: 'notes.sync.catch',
              noteCount: dirtyNotes.length,
              retryCount,
              isTransient
            });

            set({
              syncState: 'error',
              lastError: {
                message: error.message,
                timestamp: new Date(),
                noteIds: dirtyNotes.map(n => n.id)
              }
            });
          }
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
        const user = getCurrentUser();

        // Capture state BEFORE optimistic update for rollback
        const notesBeforeDelete = get().notes;
        const deletedNote = notesBeforeDelete.find(n => n.id === id);

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
              // Rollback: Restore the note
              if (deletedNote) {
                console.log('Rolling back delete due to error');
                set((state) => ({
                  notes: [...state.notes, deletedNote],
                  // Add back to pending deletes if you want to retry, or just clear err
                  // For now, simpler to just restore state so user can try again
                }));
              }
              throw error; // Re-throw to be caught below
            } else {
              console.log('Deleted note from Supabase');
              // Clear from pending deletes
              set((state) => ({
                syncState: 'idle',
                pendingDeletes: new Set([...state.pendingDeletes].filter(pid => pid !== id))
              }));
            }
          } catch (error) {
            console.error('Failed to delete note from Supabase:', error);
            // Ensure rollback happens if not already handled
            if (deletedNote && !get().notes.find(n => n.id === id)) {
              set((state) => ({ notes: [...state.notes, deletedNote] }));
            }
          }
        }
      },

      // currently firing every time tab switch
      // on sign in, if there are notes and supabase not loaded, prompt for merge
      handleSignIn: async () => {
        const { notes, hasLoadedFromSupabase, mergeState } = get();

        // Guard: Don't re-trigger if already handling merge
        if (mergeState === 'prompt') {
          console.log('Merge already in progress, skipping');
          return;
        }

        if (notes.length > 0 && !hasLoadedFromSupabase) {
          console.log("notes: ", notes);
          console.log(`Found ${notes.length} guest notes. Prompting for merge.`);

          // set guest notes as merge and set merge
          set({
            guestNotes: notes,
            mergeState: 'prompt',
            notes: [],
          });
        } else {
          // No local notes, just load normally
          await get().loadFromSupabase();
        }
      },


      // user confirms merge
      // merge guest notes to supabase
      confirmMerge: async () => {
        const user = getCurrentUser();
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
        const user = getCurrentUser();

        // If authenticated, don't persist notes (Supabase is source of truth)
        if (user) {
          return {
            notes: [],
            viewMode: state.viewMode,
            hasLoadedFromSupabase: true
            // Don't persist dirty/pending/mergeState/isFetching
          };
        }

        // If guest, persist everything EXCEPT dirty/pending/isFetching (local only)
        return {
          notes: state.notes,
          viewMode: state.viewMode,
          hasLoadedFromSupabase: false
        };
      },
    }
  )
);
