# Supabase Integration Guide

## Overview

This document outlines the recommended approach for integrating Supabase with your Zustand stores, including schema design, sync strategies, and best practices.

---

## 📊 Database Schema Recommendations

### 1. **Profiles Table** (`profiles`)

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
```

**Purpose:** Store user metadata separate from auth.users

---

### 2. **Sticky Notes Table** (`sticky_notes`)

```sql
CREATE TABLE sticky_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Position & Layout
  x INTEGER NOT NULL DEFAULT 100,
  y INTEGER NOT NULL DEFAULT 100,
  width INTEGER NOT NULL DEFAULT 300,
  height INTEGER NOT NULL DEFAULT 220,
  z_index INTEGER NOT NULL DEFAULT 1,
  
  -- Content
  text JSONB NOT NULL DEFAULT '{"type":"doc","content":[{"type":"paragraph"}]}'::jsonb,
  color TEXT NOT NULL DEFAULT '#00d3f2',
  mode TEXT NOT NULL DEFAULT 'text' CHECK (mode IN ('text', 'draw')),
  
  -- Drawing Data (optional, for draw mode)
  paths JSONB,
  inline_svg TEXT,
  
  -- Timestamps
  date_created TIMESTAMPTZ DEFAULT NOW(),
  last_edited TIMESTAMPTZ DEFAULT NOW(),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_sticky_notes_user_id ON sticky_notes(user_id);
CREATE INDEX idx_sticky_notes_last_edited ON sticky_notes(last_edited DESC);
CREATE INDEX idx_sticky_notes_z_index ON sticky_notes(z_index);

-- Enable Row Level Security
ALTER TABLE sticky_notes ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own notes
CREATE POLICY "Users can view own notes"
  ON sticky_notes FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own notes
CREATE POLICY "Users can insert own notes"
  ON sticky_notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own notes
CREATE POLICY "Users can update own notes"
  ON sticky_notes FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own notes
CREATE POLICY "Users can delete own notes"
  ON sticky_notes FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_sticky_notes_updated_at
  BEFORE UPDATE ON sticky_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

**Key Design Decisions:**
- `text` as JSONB: Stores TipTap JSON content efficiently
- `paths` as JSONB: Stores canvas paths array
- `inline_svg` as TEXT: Stores SVG string for static rendering
- Indexes on `user_id` and `last_edited` for fast queries
- RLS policies ensure data isolation

---

### 3. **Timer Sessions Table** (Optional - for analytics)

```sql
CREATE TABLE timer_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  mode TEXT NOT NULL CHECK (mode IN ('focus', 'short', 'long')),
  duration_seconds INTEGER NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  
  pomodoro_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_timer_sessions_user_id ON timer_sessions(user_id);
CREATE INDEX idx_timer_sessions_completed_at ON timer_sessions(completed_at DESC);

ALTER TABLE timer_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sessions"
  ON timer_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions"
  ON timer_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

**Purpose:** Track productivity metrics (optional for Phase 1)

---

## 🔄 Zustand-Supabase Sync Strategy

### Pattern: Optimistic Updates with Background Sync

```typescript
// Recommended pattern for useNotesStore

type SyncState = 'idle' | 'syncing' | 'error';

interface NotesStore {
  notes: StickyNote[];
  syncState: SyncState;
  lastSyncedAt: Date | null;
  
  // Local actions (optimistic)
  addNote: (note: StickyNote) => Promise<void>;
  updateNote: (id: string, updates: Partial<StickyNote>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  
  // Sync actions
  syncToSupabase: () => Promise<void>;
  loadFromSupabase: () => Promise<void>;
  
  // Auto-sync on changes (debounced)
  queueSync: () => void;
}
```

### Sync Flow:

1. **User Action** → Optimistic local update (instant UI)
2. **Queue Sync** → Debounced background sync (500ms delay)
3. **Sync to Supabase** → Upsert/Delete operations
4. **Handle Errors** → Rollback or retry logic

---

## 🎯 Implementation Recommendations

### 1. **Auth Store Pattern**

```typescript
// store/useAuth.tsx pattern

interface AuthStore {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  
  // Actions
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  
  // Initialize auth state listener
  initialize: () => void;
}
```

**Key Points:**
- Listen to `supabase.auth.onAuthStateChange` in `initialize()`
- Update store on auth state changes
- Persist session to localStorage (Supabase handles this automatically)

---

### 2. **Notes Store Sync Pattern**

```typescript
// Recommended sync implementation

const SYNC_DEBOUNCE_MS = 500;
let syncTimeout: NodeJS.Timeout | null = null;

export const useNotesStore = create<NotesStore>()(
  persist(
    (set, get) => ({
      // ... existing state
      
      addNote: async (note) => {
        // 1. Optimistic update
        set((state) => ({
          notes: [...state.notes, note],
        }));
        
        // 2. Queue sync if authenticated
        const { user } = useAuthStore.getState();
        if (user) {
          get().queueSync();
        }
      },
      
      queueSync: () => {
        // Debounce sync operations
        if (syncTimeout) clearTimeout(syncTimeout);
        
        syncTimeout = setTimeout(() => {
          get().syncToSupabase();
        }, SYNC_DEBOUNCE_MS);
      },
      
      syncToSupabase: async () => {
        const { user } = useAuthStore.getState();
        if (!user) return;
        
        set({ syncState: 'syncing' });
        
        try {
          const { notes } = get();
          
          // Upsert all notes
          const { error } = await supabase
            .from('sticky_notes')
            .upsert(
              notes.map(note => ({
                id: note.id,
                user_id: user.id,
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
              })),
              { onConflict: 'id' }
            );
          
          if (error) throw error;
          
          set({ 
            syncState: 'idle',
            lastSyncedAt: new Date(),
          });
        } catch (error) {
          console.error('Sync error:', error);
          set({ syncState: 'error' });
          // TODO: Implement retry logic or error notification
        }
      },
      
      loadFromSupabase: async () => {
        const { user } = useAuthStore.getState();
        if (!user) return;
        
        try {
          const { data, error } = await supabase
            .from('sticky_notes')
            .select('*')
            .eq('user_id', user.id)
            .order('last_edited', { ascending: false });
          
          if (error) throw error;
          
          // Transform Supabase format to app format
          const notes: StickyNote[] = (data || []).map((row) => ({
            id: row.id,
            x: row.x,
            y: row.y,
            width: row.width,
            height: row.height,
            zIndex: row.z_index,
            text: row.text,
            color: row.color,
            mode: row.mode,
            paths: row.paths || [],
            inlineSvg: row.inline_svg || '',
            dateCreated: row.date_created,
            lastEdited: row.last_edited,
          }));
          
          set({ notes, lastSyncedAt: new Date() });
        } catch (error) {
          console.error('Load error:', error);
        }
      },
    }),
    {
      name: 'sticky-notes',
      // Only persist if not authenticated (guest mode)
      partialize: (state) => {
        const { user } = useAuthStore.getState();
        return user ? { notes: [] } : { notes: state.notes };
      },
    }
  )
);
```

---

### 3. **Guest Mode Fallback**

**Strategy:** Use localStorage when not authenticated, Supabase when authenticated.

```typescript
// In useNotesStore persist config
partialize: (state) => {
  const { user } = useAuthStore.getState();
  
  // If authenticated, don't persist to localStorage
  // (Supabase is source of truth)
  if (user) {
    return { notes: [] };
  }
  
  // If guest, persist to localStorage
  return { notes: state.notes };
},
```

**On Auth State Change:**
```typescript
// In useAuthStore
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN' && session) {
    // Load notes from Supabase
    useNotesStore.getState().loadFromSupabase();
  } else if (event === 'SIGNED_OUT') {
    // Clear Supabase notes, keep localStorage notes
    useNotesStore.getState().loadFromLocalStorage();
  }
});
```

---

## 🔐 Security Best Practices

### 1. **Row Level Security (RLS)**
- ✅ Always enable RLS on user data tables
- ✅ Use `auth.uid()` in policies
- ✅ Test policies with different users

### 2. **API Keys**
- ✅ Never commit `.env.local` to git
- ✅ Use `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` for client
- ✅ Use service role key only on server (if needed)

### 3. **Data Validation**
- ✅ Validate data on client before sending
- ✅ Use Supabase database constraints (CHECK, NOT NULL)
- ✅ Sanitize user input (especially for JSONB fields)

---

## 📦 Migration Strategy

### Phase 1: Setup
1. Create Supabase project
2. Run schema migrations
3. Set up RLS policies
4. Create `lib/supabase.tsx`

### Phase 2: Auth Integration
1. Create `store/useAuth.tsx`
2. Add auth UI components (sign in/up)
3. Test auth flow

### Phase 3: Notes Sync
1. Update `useNotesStore` with sync functions
2. Implement optimistic updates
3. Add error handling and retry logic
4. Test guest vs authenticated modes

### Phase 4: Polish
1. Add loading states
2. Add sync indicators
3. Add conflict resolution (if needed)
4. Add analytics (optional)

---

## 🐛 Error Handling Patterns

### Network Errors
```typescript
try {
  await syncToSupabase();
} catch (error) {
  if (error.code === 'PGRST116') {
    // Network error - queue for retry
    queueRetry();
  } else {
    // Other error - show notification
    showErrorNotification(error.message);
  }
}
```

### Conflict Resolution
```typescript
// If note was edited on another device
// Strategy: Last write wins (or merge if needed)
const handleConflict = (localNote: StickyNote, remoteNote: any) => {
  const localTime = new Date(localNote.lastEdited);
  const remoteTime = new Date(remoteNote.last_edited);
  
  return localTime > remoteTime ? localNote : transformRemoteNote(remoteNote);
};
```

---

## 📝 Environment Variables

Create `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**Never commit this file!** Add to `.gitignore`.

---

## ✅ Testing Checklist

- [ ] Auth: Sign up flow works
- [ ] Auth: Sign in flow works
- [ ] Auth: Sign out clears session
- [ ] Auth: Session persists on refresh
- [ ] Notes: Create note syncs to Supabase
- [ ] Notes: Update note syncs to Supabase
- [ ] Notes: Delete note syncs to Supabase
- [ ] Notes: Load notes on sign in
- [ ] Notes: Guest mode uses localStorage
- [ ] Notes: Sync works offline (queues for later)
- [ ] RLS: Users can't see other users' notes
- [ ] RLS: Users can't modify other users' notes

---

## 🚀 Performance Considerations

1. **Debounce Syncs:** Don't sync on every keystroke
2. **Batch Operations:** Use `upsert` with array instead of individual inserts
3. **Indexes:** Ensure indexes on `user_id` and `last_edited`
4. **Pagination:** For large note lists, implement pagination
5. **Optimistic Updates:** Always update UI first, sync later

---

## 📚 Additional Resources

- [Supabase JS Client Docs](https://supabase.com/docs/reference/javascript/introduction)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Zustand Persist Middleware](https://github.com/pmndrs/zustand/blob/main/docs/integrations/persisting-store-data.md)

---

**Last Updated:** $(date)
