# Auth & Notes Sync Architecture

## Overview
This document outlines the architecture for authentication and sticky note synchronization in the application. It details the design decisions, data flow, and future considerations.

## 1. Authentication (`useAuth.tsx`)

### Architecture
We use Supabase Auth for user management. The state is managed globally via Zustand in `store/useAuth.tsx`.

### Design Decisions
*   **Separation of Concerns:** Auth logic is isolated in `useAuth` to avoid circular dependencies with `useNotes`. `useNotes` imports `useAuth` dynamically (or via getters) where needed.
*   **Reactive State:** We subscribe to `supabase.auth.onAuthStateChange` to automatically update the store. This ensures the UI is always in sync with the actual session state, even if the session expires or is refreshed externally.
*   **Event-Driven Data Loading:** Data loading is triggered by auth events (`SIGNED_IN`), rather than manual calls from UI components. This ensures data is loaded as soon as authentication is confirmed.

### The Auth Flow
1.  **Initialization:** `initialize()` checks for an active session on app mount.
2.  **Sign In/Up:** Calls Supabase API. On success, the `onAuthStateChange` listener fires.
3.  **State Change Listener:**
    *   **SIGNED_IN:** Updates user state. **Crucially**, it calls `useNotesStore.getState().handleSignIn()` to trigger the notes loading/merging logic.
    *   **SIGNED_OUT:** Clears user state and clears sensitive data from `useNotesStore`.

## 2. Notes Synchronization (`useNotes.tsx`)

### Architecture
The notes store uses a **Hybrid Sync Approach** (Dirty Tracking + Batching) with an **Optimistic UI**.

### Design Decisions
*   **Optimistic Updates:** UI updates immediately (state changes locally first). Sync happens in the background. This makes the app feel instant.
*   **Dirty Tracking:** We maintain a `dirtyNoteIds` Set. Only notes that have changed are sent to the server. This reduces bandwidth and database writes significantly (O(1) vs O(N)).
*   **Batching & Debouncing:** Updates are debounced (500ms). Multiple rapid changes to different notes are batched into a single API call.
*   **Immediate Deletes:** Deletions are **not** debounced. They correspond to explicit user intent and should happen immediately to minimize conflict windows.

### The Sync Flow
1.  **User Action (e.g., Move Note):**
    *   Update local state (UI moves).
    *   Add Note ID to `dirtyNoteIds`.
    *   Call `queueSync()`.
2.  **Queue Sync:**
    *   Resets 500ms timer.
3.  **Sync Execution:**
    *   Filter notes to find only those in `dirtyNoteIds`.
    *   Send `upsert` request to Supabase for these notes.
    *   **On Success:** Clear `dirtyNoteIds` and update `lastSyncedAt`.
    *   **On Error:** Keep `dirtyNoteIds` to retry later. Log error state.

## 3. Guest Notes Merging

### The Problem
Users might start using the app as a guest (creating local notes) and then decide to sign in. We must not lose their work.

### The Solution: "Merge Prompt"
When a user signs in, we intercept the normal loading flow:

1.  **Interception:** `handleSignIn()` checks if there are existing notes in the local store.
2.  **Decision Point:**
    *   **No Local Notes:** Proceed to load from Supabase immediately.
    *   **Has Local Notes:** Pause loading. Move local notes to `guestNotes` buffer. Set `mergeState = 'prompt'`.
3.  **User Prompt (UI):** A modal asks the user: "Unsaved Notes Found. Merge or Discard?"
4.  **Resolution:**
    *   **Merge:** Uploads `guestNotes` to Supabase (re-keyed to the new user). Then loads all notes from Supabase.
    *   **Discard:** Clears `guestNotes`. Loads from Supabase.

## 4. Current Limitations & Considerations

### Conflict Resolution
*   **Current Strategy:** "Last Write Wins" (Server relies on `upsert`).
*   **Limitation:** If you edit Note A on two devices offline, the last one to sync overwrites the other. There is no field-level merging.

### Offline Support
*   **Guest Mode:** Fully offline capable (persisted to LocalStorage).
*   **Auth Mode:**
    *   **Writes:** Work offline (queued in memory/state), but **will be lost if the tab is closed** before connection returns (since we disable LocalStorage persistence for auth users to avoid staleness).
    *   **Reads:** Requires connection on initial load.

### Scalability
*   **Dirty Tracking:** Solves the bandwidth issue.
*   **List Size:** We currently load *all* notes on startup. If a user has 10,000 notes, this initial fetch might be slow. Future optimization: Pagination or Windowing.

## 5. Next Steps

1.  **Offline Persistence for Auth Users:**
    *   Enable LocalStorage persistence for auth users *associated with their User ID*.
    *   On load, show local data immediately ("Stale-While-Revalidate"), then fetch fresh data from Supabase.
    *   Requires careful cache invalidation on logout.

2.  **Conflict Resolution:**
    *   Implement a `updated_at` check. If server `updated_at` > local `updated_at`, prompt user or merge intelligently.

3.  **Real-time Subscriptions:**
    *   Use Supabase Realtime to listen for changes from other devices and update the UI instantly without waiting for a re-fetch.
