/**
 * Helper function to create or get user profile
 * This is called after signup or when a user signs in for the first time
 */
import { supabase } from './supabase';
import type { User } from '@supabase/supabase-js';

export const createOrGetProfile = async (user: User) => {
  try {
    // First, try to get existing profile
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    // If profile exists, return it
    if (existingProfile && !fetchError) {
      return existingProfile;
    }

    // If profile doesn't exist, create it
    const { data: newProfile, error: createError } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        email: user.email || null,
        full_name: user.user_metadata?.full_name || null,
        avatar_url: user.user_metadata?.avatar_url || null,
      })
      .select()
      .single();

    if (createError) {
      // If insert fails, it might be a race condition (trigger already created it)
      // Try fetching again
      const { data: profile, error: retryError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (retryError) {
        console.error('Failed to create or fetch profile:', retryError);
        throw retryError;
      }

      return profile;
    }

    return newProfile;
  } catch (error) {
    console.error('Error in createOrGetProfile:', error);
    throw error;
  }
};
