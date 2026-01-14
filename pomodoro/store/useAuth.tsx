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
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
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

          if (session?.user) {
            await get().loadProfile();
            const { useNotesStore } = await import('./useNotes');
            await useNotesStore.getState().initialize();
          } else {
            const { useNotesStore } = await import('./useNotes');
            useNotesStore.getState().initialize();
          }
        });

        // Listen for auth state changes (keep it synchronous!)
        supabase.auth.onAuthStateChange((event, session) => {
          console.log('Auth state changed:', event, session?.user?.email);

          // Update auth state synchronously
          set({
            session,
            user: session?.user ?? null,
            isLoading: false,
          });

          // Handle side effects in background (non-blocking)
          if (event === 'SIGNED_IN' && session?.user) {
            console.log('User signed in, loading data...');
            get().loadProfile();
            import('./useNotes').then(({ useNotesStore }) => {
              useNotesStore.getState().loadFromSupabase();
            });
          } else if (event === 'SIGNED_OUT') {
            console.log('User signed out, clearing data...');
            set({ profile: null });
            import('./useNotes').then(({ useNotesStore }) => {
              useNotesStore.setState({ notes: [] }); //TODO: is this the flow we want? clearing our notes on sign out?
            });
          } else if (event === 'TOKEN_REFRESHED') {
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
          
          // Let onAuthStateChange handle the rest
          
        } catch (error: any) {
          set({
            error: error.message || 'Failed to sign in',
            isLoading: false,
          });
          throw error;
        }
      },

      signUp: async (email: string, password: string, firstName: string, lastName: string) => {
        try {
          set({ isLoading: true, error: null });

          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: `${firstName} ${lastName}`,
              },
            }, 
          });

          if (error) throw error;
          console.log("Sign up data:", data);
          // Let onAuthStateChange handle the rest
          
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

          const redirectUrl = `${window.location.origin}/auth/callback`;

          const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: redirectUrl,
            },
          });

          if (error) throw error;
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
          console.log("Signing out...");
          
          const { error } = await supabase.auth.signOut();
          
          if (error) throw error;
          
          console.log("Sign out complete - auth state change will update store");
          
        } catch (error: any) {
          console.error("Sign out error:", error);
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
      partialize: (state) => ({
        user: state.user ? { id: state.user.id } as User : null,
      }),
    }
  )
);

if (typeof window !== 'undefined') {
  useAuthStore.getState().initialize();
}