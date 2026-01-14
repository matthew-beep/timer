-- ============================================
-- Database Triggers for Auto Profile Creation
-- ============================================
-- 
-- This file contains SQL triggers that automatically create
-- user profiles when users sign up via email or OAuth.
--
-- Run this in your Supabase SQL Editor:
-- 1. Go to Supabase Dashboard > SQL Editor
-- 2. Paste this entire file
-- 3. Click "Run"
-- ============================================

-- Function to handle new user signups
-- This runs automatically when a new user is created in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    -- Try to get name from metadata (works for OAuth providers)
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      NULL
    ),
    -- Get avatar URL from metadata (for OAuth providers like Google)
    NEW.raw_user_meta_data->>'avatar_url'
  )
  -- If profile already exists (race condition), do nothing
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if it exists (for re-running this script)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger that fires after a new user is inserted into auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- Verification Query
-- ============================================
-- After running this, you can verify it works by:
-- 1. Creating a new user (via signup or OAuth)
-- 2. Running: SELECT * FROM profiles WHERE id = 'user-id-here';
-- 
-- The profile should be created automatically!
-- ============================================
