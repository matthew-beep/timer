# Profile Integration Guide

## How Profiles Work with Authentication

### Overview

When a user signs up (via email or OAuth), a profile record is automatically created in the `profiles` table. This profile stores additional user metadata beyond what's in `auth.users`.

---

## Profile Creation Flow

### Method 1: Database Trigger (Recommended) ✅

**Location:** `database/triggers.sql`

A PostgreSQL trigger automatically creates a profile when a new user is inserted into `auth.users`. This is the most reliable method because:

- ✅ Works for all auth methods (email, Google, etc.)
- ✅ Server-side, no race conditions
- ✅ Always runs, even if client code fails
- ✅ Handles OAuth metadata automatically

**To set up:**
1. Run the SQL in `database/triggers.sql` in your Supabase SQL Editor
2. The trigger will automatically create profiles for all new users

### Method 2: Client-Side Fallback

**Location:** `lib/createProfile.ts` and `store/useAuth.tsx`

If the database trigger doesn't run (or for existing users), the client-side code will:

1. Check if profile exists
2. Create it if missing
3. Return the profile

This is called automatically:
- After `signUp()`
- After `signInWithGoogle()` completes
- On `SIGNED_IN` auth event
- When `loadProfile()` is called manually

---

## Using Profiles in Your App

### Access Profile Data

```tsx
import { useAuthStore } from '@/store/useAuth';

function MyComponent() {
  const { user, profile, loadProfile } = useAuthStore();
  
  // Profile contains:
  // - id (same as user.id)
  // - email
  // - full_name
  // - avatar_url
  // - created_at
  // - updated_at
  
  if (!profile && user) {
    // Profile might be loading, try to load it
    loadProfile();
  }
  
  return (
    <div>
      {profile && (
        <>
          <p>Name: {profile.full_name || 'No name set'}</p>
          <p>Email: {profile.email}</p>
          {profile.avatar_url && (
            <img src={profile.avatar_url} alt="Avatar" />
          )}
        </>
      )}
    </div>
  );
}
```

### Update Profile

```tsx
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuth';

async function updateProfile(fullName: string) {
  const { user } = useAuthStore.getState();
  if (!user) return;

  const { data, error } = await supabase
    .from('profiles')
    .update({ full_name: fullName })
    .eq('id', user.id)
    .select()
    .single();

  if (!error && data) {
    // Update the store
    useAuthStore.setState({ profile: data });
  }
}
```

---

## Profile Data Structure

### From Database

```typescript
{
  id: string;              // UUID, matches auth.users.id
  email: string | null;    // User's email
  full_name: string | null; // Display name
  avatar_url: string | null; // Profile picture URL
  created_at: string;      // ISO timestamp
  updated_at: string;      // ISO timestamp
}
```

### OAuth Providers (Google, etc.)

When users sign in with OAuth, the trigger automatically extracts:
- `full_name` from `raw_user_meta_data.full_name` or `raw_user_meta_data.name`
- `avatar_url` from `raw_user_meta_data.avatar_url`
- `email` from the user's email

---

## Integration Points

### 1. Auth Store (`store/useAuth.tsx`)

- Stores `profile` in state
- Calls `loadProfile()` on sign-in
- Automatically creates profile if missing

### 2. Notes Store (Future)

When syncing notes to Supabase:
```typescript
const { user } = useAuthStore.getState();
if (user) {
  // Use user.id for user_id in sticky_notes table
  await supabase.from('sticky_notes').insert({
    user_id: user.id,
    // ... note data
  });
}
```

### 3. UI Components

Use profile data for:
- Displaying user name/avatar in header
- Personalization
- User settings
- Profile editing

---

## Common Patterns

### Check if User Has Profile

```tsx
const { user, profile, isLoading } = useAuthStore();

if (isLoading) {
  return <div>Loading...</div>;
}

if (!user) {
  return <div>Please sign in</div>;
}

if (!profile) {
  // Profile might be creating, wait a moment
  return <div>Setting up your profile...</div>;
}

// User and profile are ready
return <div>Welcome, {profile.full_name}!</div>;
```

### Wait for Profile

```tsx
useEffect(() => {
  const { user, profile, loadProfile } = useAuthStore.getState();
  
  if (user && !profile) {
    // Try to load/create profile
    loadProfile();
  }
}, [user, profile]);
```

---

## Troubleshooting

### Profile is null after sign-in

1. **Check if trigger is set up:**
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
   ```

2. **Manually create profile:**
   ```tsx
   const { user, loadProfile } = useAuthStore();
   if (user) {
     await loadProfile();
   }
   ```

3. **Check browser console** for errors

### Profile not updating

- Make sure RLS policies allow updates
- Check that you're updating the correct user's profile
- Verify the update query is using the correct `id`

### OAuth profile missing data

- Check `auth.users.raw_user_meta_data` in Supabase dashboard
- The trigger extracts data from metadata automatically
- You can manually update the profile if needed

---

## Next Steps

1. ✅ Set up database trigger (`database/triggers.sql`)
2. ✅ Test profile creation with email signup
3. ✅ Test profile creation with Google OAuth
4. 🔄 Add profile editing UI
5. 🔄 Use profile data in your components
6. 🔄 Sync notes with user profiles

---

**Last Updated:** $(date)
