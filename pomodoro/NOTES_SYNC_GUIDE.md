# Notes Sync Guide

## Overview

Your notes store now automatically syncs with Supabase when authenticated, and falls back to localStorage for guest users.

---

## How It Works

### Authentication States

#### **Guest Mode (Not Authenticated)**
- Notes are stored in **localStorage only**
- No Supabase sync
- Data persists across browser sessions
- Each browser/device has its own notes

#### **Authenticated Mode**
- Notes are stored in **Supabase** (primary source of truth)
- Changes sync automatically with debouncing
- Notes load from Supabase on sign-in
- localStorage is cleared (Supabase is the source)

---

## Sync Flow

### 1. **Loading Notes**

**On App Start:**
```typescript
// Auth store initializes first
useAuthStore.getState().initialize();

// Then notes store initializes
useNotesStore.getState().initialize();
```

**If Authenticated:**
- Loads notes from Supabase
- Replaces any localStorage notes

**If Guest:**
- Loads notes from localStorage
- No Supabase call

### 2. **Creating/Updating Notes**

**Optimistic Updates:**
1. UI updates immediately (optimistic)
2. Change is queued for sync (500ms debounce)
3. After debounce, syncs to Supabase
4. On error, sync state is set to 'error'

**Example:**
```typescript
const { addNote } = useNotesStore();

// This updates UI immediately, then syncs in background
await addNote({
  id: 'note-1',
  x: 100,
  y: 100,
  // ... other fields
});
```

### 3. **Deleting Notes**

- Deletes immediately from Supabase (no debounce)
- Also updates UI optimistically
- If Supabase delete fails, note stays in UI (you could add error handling)

---

## Data Transformation

### App Format → Supabase Format

```typescript
{
  id: string,
  x: number,
  y: number,
  zIndex: number,      // → z_index
  text: JSONContent,   // → text (JSONB)
  color: string,
  mode: 'text' | 'draw',
  paths: CanvasPath[], // → paths (JSONB)
  inlineSvg: string,   // → inline_svg
  dateCreated: string, // → date_created
  lastEdited: string,  // → last_edited
}
```

### Supabase Format → App Format

The transformation happens automatically when loading from Supabase.

---

## Store State

### New State Properties

```typescript
{
  notes: StickyNote[],
  syncState: 'idle' | 'syncing' | 'error',
  lastSyncedAt: Date | null,
  isInitialized: boolean,
  // ... existing properties
}
```

### Using Sync State

```tsx
import { useNotesStore } from '@/store/useNotes';

function SyncIndicator() {
  const { syncState, lastSyncedAt } = useNotesStore();
  
  return (
    <div>
      {syncState === 'syncing' && <span>Syncing...</span>}
      {syncState === 'error' && <span>Sync error!</span>}
      {syncState === 'idle' && lastSyncedAt && (
        <span>Last synced: {lastSyncedAt.toLocaleTimeString()}</span>
      )}
    </div>
  );
}
```

---

## API Reference

### Methods

#### `initialize()`
Initializes the notes store. Called automatically by auth store.

```typescript
await useNotesStore.getState().initialize();
```

#### `loadFromSupabase()`
Manually load notes from Supabase (usually called automatically).

```typescript
await useNotesStore.getState().loadFromSupabase();
```

#### `syncToSupabase()`
Manually sync all notes to Supabase (usually called automatically via `queueSync`).

```typescript
await useNotesStore.getState().syncToSupabase();
```

#### `queueSync()`
Queues a sync operation (debounced). Called automatically after `addNote`, `updateNote`, etc.

```typescript
useNotesStore.getState().queueSync();
```

---

## Integration with Auth

### Sign In Flow

1. User signs in → `SIGNED_IN` event fires
2. Auth store loads profile
3. Notes store loads notes from Supabase
4. UI updates with user's notes

### Sign Out Flow

1. User signs out → `SIGNED_OUT` event fires
2. Notes store clears Supabase notes
3. Notes store rehydrates from localStorage (if any guest notes exist)
4. UI shows guest notes

---

## Error Handling

### Sync Errors

If sync fails:
- `syncState` is set to `'error'`
- Notes remain in local state (optimistic updates)
- You can retry by calling `syncToSupabase()` manually

### Network Errors

- Sync will fail silently (logged to console)
- User can continue working (notes in local state)
- Sync will retry on next change

### RLS Policy Errors

If you see permission errors:
- Check that RLS policies are set up correctly
- Verify user is authenticated
- Check that `user_id` matches authenticated user

---

## Testing

### Test Guest Mode

1. Don't sign in
2. Create a note
3. Refresh page
4. Note should persist (from localStorage)

### Test Authenticated Mode

1. Sign in
2. Create a note
3. Check Supabase dashboard → `sticky_notes` table
4. Note should appear there
5. Sign out and sign back in
6. Note should load from Supabase

### Test Sync

1. Sign in
2. Create/update a note
3. Check console for "Synced X notes to Supabase"
4. Check Supabase dashboard to verify

---

## Troubleshooting

### Notes not loading from Supabase

1. **Check authentication:**
   ```typescript
   const { user } = useAuthStore.getState();
   console.log('User:', user);
   ```

2. **Check initialization:**
   ```typescript
   const { isInitialized } = useNotesStore.getState();
   console.log('Initialized:', isInitialized);
   ```

3. **Manually load:**
   ```typescript
   await useNotesStore.getState().loadFromSupabase();
   ```

### Notes not syncing

1. **Check sync state:**
   ```typescript
   const { syncState } = useNotesStore.getState();
   console.log('Sync state:', syncState);
   ```

2. **Check if user is authenticated:**
   - Sync only happens when authenticated

3. **Check browser console** for errors

### Duplicate notes

- This shouldn't happen, but if it does:
  - Check that `id` is unique
  - Check Supabase for duplicates
  - Clear localStorage and reload

---

## Performance Considerations

### Debouncing

- Syncs are debounced by 500ms
- Multiple rapid changes = one sync
- Reduces Supabase API calls

### Batch Operations

- All notes are synced in one `upsert` call
- Efficient for multiple changes

### Optimistic Updates

- UI updates immediately
- No waiting for network
- Better user experience

---

## Next Steps

1. ✅ Notes sync is working
2. 🔄 Add sync status indicator to UI
3. 🔄 Add retry button for failed syncs
4. 🔄 Add conflict resolution (if editing on multiple devices)
5. 🔄 Add offline queue (sync when back online)

---

## Code Examples

### Check if Notes are Synced

```tsx
const { syncState, lastSyncedAt } = useNotesStore();

if (syncState === 'idle' && lastSyncedAt) {
  console.log('All synced!');
}
```

### Force Sync

```tsx
const { syncToSupabase } = useNotesStore();

// Force immediate sync (bypasses debounce)
await syncToSupabase();
```

### Monitor Sync State

```tsx
useEffect(() => {
  const { syncState } = useNotesStore.getState();
  console.log('Sync state changed:', syncState);
}, [syncState]);
```

---

**Last Updated:** $(date)
