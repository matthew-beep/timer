# Google OAuth Setup Guide

## Overview

This guide walks you through setting up Google OAuth authentication in your Supabase project.

---

## Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth client ID**
5. If prompted, configure the OAuth consent screen:
   - Choose **External** (unless you have a Google Workspace)
   - Fill in required fields (App name, User support email, Developer contact)
   - Add scopes: `email`, `profile`
   - Add test users if your app is in testing mode
6. Create OAuth client ID:
   - Application type: **Web application**
   - Name: `Pomodoro Timer` (or your app name)
   - Authorized JavaScript origins:
     - `http://localhost:3000` (for local development)
     - `https://your-production-domain.com` (for production)
   - Authorized redirect URIs:
     - `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
     - You'll get this from Supabase in the next step

7. **Save your Client ID and Client Secret** - you'll need these for Supabase

---

## Step 2: Configure Google Provider in Supabase

1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Navigate to **Authentication** > **Providers**
4. Find **Google** in the list and click to enable it
5. Enter your Google OAuth credentials:
   - **Client ID (for OAuth)**: Your Google Client ID
   - **Client Secret (for OAuth)**: Your Google Client Secret
6. Click **Save**

---

## Step 3: Add Redirect URL to Google

1. Go back to Google Cloud Console
2. Edit your OAuth client
3. In **Authorized redirect URIs**, add:
   ```
   https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
   ```
   - Replace `YOUR_PROJECT_REF` with your Supabase project reference
   - You can find this in your Supabase project URL or in the Auth settings

---

## Step 4: Update Your App

The code is already set up! Here's what was added:

### Auth Store (`store/useAuth.tsx`)
- `signInWithGoogle()` method that initiates OAuth flow
- Profile creation on sign-in

### Callback Route (`app/auth/callback/route.ts`)
- Handles the OAuth redirect from Google
- Exchanges the code for a session
- Redirects back to your app

### Profile Creation (`lib/createProfile.ts`)
- Automatically creates/gets user profile on sign-in
- Works with both email and Google OAuth

---

## Step 5: Test the Integration

1. **Start your dev server:**
   ```bash
   npm run dev
   ```

2. **Add a test button in your app:**
   ```tsx
   import { useAuthStore } from '@/store/useAuth';
   
   const { signInWithGoogle } = useAuthStore();
   
   <button onClick={() => signInWithGoogle()}>
     Sign in with Google
   </button>
   ```

3. **Test the flow:**
   - Click the button
   - You should be redirected to Google
   - Sign in with your Google account
   - You'll be redirected back to your app
   - Check the console for auth state changes
   - Check Supabase dashboard > Authentication > Users to see the new user

---

## Step 6: Database Trigger (Recommended)

To automatically create profiles when users sign up, add this trigger to your Supabase database:

```sql
-- Function to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function on user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

**To add this:**
1. Go to Supabase Dashboard > SQL Editor
2. Paste the SQL above
3. Click **Run**

This ensures profiles are created automatically when users sign up via email or OAuth.

---

## Troubleshooting

### "Redirect URI mismatch" error
- Make sure the redirect URI in Google Console exactly matches:
  `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
- Check for trailing slashes or typos

### Profile not created
- Check if the database trigger is set up (Step 6)
- Check browser console for errors
- The `createOrGetProfile` function in `lib/createProfile.ts` is a fallback

### OAuth not working in production
- Make sure you've added your production domain to Google Console
- Update the redirect URI in your app code if needed
- Check that environment variables are set correctly

### User signed in but profile is null
- The profile should be created automatically
- Check Supabase logs for errors
- Try calling `loadProfile()` manually:
  ```tsx
  const { loadProfile } = useAuthStore();
  await loadProfile();
  ```

---

## Security Notes

- ✅ Never commit OAuth credentials to git
- ✅ Use environment variables for sensitive data
- ✅ The OAuth flow is handled server-side by Supabase
- ✅ RLS policies protect user data
- ✅ Sessions are automatically refreshed

---

## Next Steps

After Google OAuth is working:
1. Add more OAuth providers (GitHub, Discord, etc.) using the same pattern
2. Customize the OAuth consent screen in Google Console
3. Add profile editing functionality
4. Sync user data to your notes store

---

**Last Updated:** $(date)
