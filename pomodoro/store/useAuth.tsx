import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';
import { createOrGetProfile } from '@/lib/createProfile';
import type { User, Session } from '@supabase/supabase-js';

interface AuthStore {
  user: User | null;
  session: Session | null;
  profile: any | null; // Profile from profiles table
  isLoading: boolean;
  error: string | null;

  // Actions
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  initialize: () => void;
  clearError: () => void;
  loadProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      profile: null,
      isLoading: true,
      error: null,

      loadProfile: async () => {
        const { user } = get();
        if (!user) {
          set({ profile: null });
          return;
        }

        try {
          const profile = await createOrGetProfile(user);
          set({ profile });
        } catch (error) {
          console.error('Failed to load profile:', error);
          // Don't throw - profile creation might fail but auth should still work
        }
      },

      initialize: () => {
        // Get initial session
        supabase.auth.getSession().then(async ({ data: { session } }) => {
          set({
            session,
            user: session?.user ?? null,
            isLoading: false,
          });

          // Load profile and notes if user is signed in
          if (session?.user) {
            await get().loadProfile();
            // Initialize notes store (load from Supabase if authenticated)
            const { useNotesStore } = await import('./useNotes');
            await useNotesStore.getState().initialize();
          } else {
            // If not authenticated, initialize notes store to load from localStorage
            const { useNotesStore } = await import('./useNotes');
            useNotesStore.getState().initialize();
          }
        });

        // Listen for auth state changes
        supabase.auth.onAuthStateChange(async (event, session) => {
          console.log('Auth state changed:', event, session?.user?.email);

          set({
            session,
            user: session?.user ?? null,
            isLoading: false,
          });

          // Handle specific events
          if (event === 'SIGNED_IN' && session?.user) {
            // User signed in - create/get profile and load their data
            await get().loadProfile();
            // Load notes from Supabase
            const { useNotesStore } = await import('./useNotes');
            await useNotesStore.getState().loadFromSupabase();
          } else if (event === 'SIGNED_OUT') {
            // User signed out - clear Supabase data, keep localStorage for guest mode
            set({ user: null, session: null, profile: null });
            // Clear notes from store (they'll be loaded from localStorage if any)
            const { useNotesStore } = await import('./useNotes');
            useNotesStore.setState({ notes: [] });
            // Reload from localStorage (persist middleware will handle this)
            useNotesStore.persist.rehydrate();
          } else if (event === 'TOKEN_REFRESHED') {
            // Session refreshed - update store
            set({ session });
          }
        });
      },

      signIn: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null });

          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) throw error;

          set({
            user: data.user,
            session: data.session,
            isLoading: false,
          });
        } catch (error: any) {
          set({
            error: error.message || 'Failed to sign in',
            isLoading: false,
          });
          throw error;
        }
      },

      signUp: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null });

          const { data, error } = await supabase.auth.signUp({
            email,
            password,
          });

          if (error) throw error;

          set({
            user: data.user,
            session: data.session,
            isLoading: false,
          });

          // Create profile after signup (database trigger should handle this, but this is a fallback)
          if (data.user) {
            await get().loadProfile();
          }
        } catch (error: any) {
          set({
            error: error.message || 'Failed to sign up',
            isLoading: false,
          });
          throw error;
        }
      },

      signInWithGoogle: async () => {
        try {
          set({ isLoading: true, error: null });

          // Get the current URL for redirect
          const redirectUrl = `${window.location.origin}/auth/callback`;

          const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: redirectUrl,
            },
          });

          if (error) throw error;

          // Note: The actual sign-in happens on the callback page
          // The user will be redirected to Google, then back to /auth/callback
        } catch (error: any) {
          set({
            error: error.message || 'Failed to sign in with Google',
            isLoading: false,
          });
          throw error;
        }
      },

      signOut: async () => {
        try {
          set({ isLoading: true, error: null });
          console.log("signing out from store");
          const { error } = await supabase.auth.signOut();
          console.log("got response");
          if (error) throw error;

          set({
            user: null,
            session: null,
            isLoading: false,
          });
          console.log("signed out");
          console.log("user: ", get().user);
          console.log("session: ", get().session);
          console.log("profile: ", get().profile);
          console.log("isLoading: ", get().isLoading);
          console.log("error: ", get().error);
        } catch (error: any) {
          set({
            error: error.message || 'Failed to sign out',
            isLoading: false,
          });
          throw error;
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      // Only persist user ID and session token, not full user object
      partialize: (state) => ({
        // Supabase handles session persistence automatically
        // We just need to track that auth was initialized
        user: state.user ? { id: state.user.id } as User : null,
      }),
    }
  )
);

// Initialize auth on store creation (runs once)
if (typeof window !== 'undefined') {
  useAuthStore.getState().initialize();
}
