# Proposed Type Definitions

## 1. Auth Store Types (`useAuth.tsx`)

The `profile` property is currently `any | null`. Based on the `profiles` table schema (implied from typical Supabase setups and `createProfile` usage), we should define a strict `Profile` interface.

```typescript
// Proposed Profile Interface
export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at?: string;
  // Add other profile fields as they exist in your DB
}

// Update AuthStore interface
interface AuthStore {
  user: User | null;
  session: Session | null;
  profile: Profile | null; // <--- Replace 'any'
  isLoading: boolean;
  error: string | null;
  // ... rest of interface
}
```

## 2. Notes Store Types (`useNotes.tsx`)

The `transformSupabaseNote` function uses `any` for the `row` argument. We should define a type that matches the Supabase database response for the `sticky_notes` table.

```typescript
// Proposed Database Row Type
// This represents the raw shape returned by Supabase
export interface StickyNoteRow {
  id: string;
  user_id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  z_index: number;
  text: JSONContent; // or any/unknown if strictness varies, but JSONContent is best
  color: string;
  mode: "draw" | "text"; // Assuming strict enum in DB, otherwise string
  paths: CanvasPath[] | null;
  inline_svg: string | null;
  date_created: string;
  last_edited: string;
  created_at?: string;
  updated_at?: string;
}

// Update transform function signature
const transformSupabaseNote = (row: StickyNoteRow): StickyNote => ({
  // ... logic remains same
});
```

## 3. Implementation Plan (Future)

1.  **Create shared types file:** Consider creating a `types/supabase.ts` or `types/database.ts` file if you plan to generate types from your Supabase schema (highly recommended using `supabase gen types`).
2.  **Import & Apply:** Import these interfaces into `useAuth.tsx` and `useNotes.tsx` and replace usages of `any`.

## 4. Official Supabase Type Generation Workflow

To automatically generate types that match your database schema exactly, follow these steps:

### Prerequisites
You need the Supabase CLI installed.
```bash
npm install -g supabase
```

### Steps to Generate
1.  **Login to Supabase CLI:**
    ```bash
    supabase login
    ```
2.  **Link your project:**
    (You will need your Reference ID from the Supabase Dashboard Settings -> General)
    ```bash
    supabase link --project-ref your-project-ref-id
    ```
3.  **Generate Types:**
    Run this command to output the types to a file in your project:
    ```bash
    supabase gen types typescript --linked > types/supabase.ts
    ```

### Using the Generated Types
Once generated, you can use the `Database` interface to strictly type your direct Supabase queries:

```typescript
import { Database } from '@/types/supabase';

// In useNotes.tsx
// Instead of manually defining StickyNoteRow, you can infer it:
type StickyNoteRow = Database['public']['Tables']['sticky_notes']['Row'];

// In useAuth.tsx
type ProfileRow = Database['public']['Tables']['profiles']['Row'];
```
This is the **recommended** robust way to handle types long-term.


## 5. Integration Plan: Applying Generated Types

Now that you have `types/supabase.tsx`, here is how to integrating it into your stores.

### Step 1: define Shared Helper Types
Create a new file `types/app.ts` (or just add to the top of your store files) to extract the specific Row types you need.

```typescript
// types/app.ts (Recommended)
import { Database } from './supabase';

export type ProfileRow = Database['public']['Tables']['profiles']['Row'];
export type StickyNoteRow = Database['public']['Tables']['sticky_notes']['Row'];
```

### Step 2: Update `store/useAuth.tsx`

1.  **Import Types:**
    ```typescript
    import type { ProfileRow } from '@/types/app'; // or direct from supabase.tsx
    ```
2.  **Replace `any` in Store Interface:**
    ```typescript
    interface AuthStore {
      // ...
      profile: ProfileRow | null; // was any | null
      // ...
    }
    ```

### Step 3: Update `store/useNotes.tsx`

1.  **Import Types:**
    ```typescript
    import type { StickyNoteRow } from '@/types/app';
    ```

2.  **Fix `transform` functions:**
    The `transformSupabaseNote` function currently takes `row: any`. Update it to use `StickyNoteRow`.

    ```typescript
    // BEFORE
    const transformSupabaseNote = (row: any): StickyNote => ({ ... })

    // AFTER
    const transformSupabaseNote = (row: StickyNoteRow): StickyNote => ({
      id: row.id,
      x: row.x,
      y: row.y,
      // You might need to cast JSON types if TS complains about Json not matching JSONContent
      text: row.text as unknown as JSONContent, 
      color: row.color,
      // ... map other fields
    });
    ```

3.  **Type the Supabase Query:**
    When you call `supabase.from('sticky_notes')`, you want it to know the return type.
    
    You have two options:
    **Option A: Global Typed Client (Best)**
    Update `lib/supabase.ts` to use the Database definition.
    ```typescript
    // lib/supabase.ts
    import { createClient } from '@supabase/supabase-js';
    import { Database } from '@/types/supabase';

    export const supabase = createClient<Database>(...);
    ```
    *Now `supabase.from('sticky_notes').select('*')` automatically knows it returns `StickyNoteRow[]`.*

    **Option B: Manual Assertion (Quickest)**
    Keep using untyped client but assert the data in the store.
    ```typescript
    const { data } = await supabase.from('sticky_notes')...
    const notes = (data as StickyNoteRow[]).map(transformSupabaseNote);
    ```

### Recommended Order of Operations
1.  Update `lib/supabase.ts` to use generic `createClient<Database>`.
2.  Update `useAuth.tsx` to use `ProfileRow`.
3.  Update `useNotes.tsx` to use `StickyNoteRow` and fix transforms.
