import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';
import { createOrGetProfile } from '@/lib/createProfile';
import type { User, Session, AuthError } from '@supabase/supabase-js';
import type { Tables } from '@/types/supabase';



interface AuthStore {
  user: User | null;
  session: Session | null;
  profile: Tables<'profiles'> | null; // Profile from profiles table
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
  isLoadingProfile: boolean; // ← NEW: Guard against duplicate profile loads


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
      isInitialized: false,
      isLoadingProfile: false,
      loadProfile: async () => {
        const { user, isLoadingProfile } = get();
        if (!user) {
          set({ profile: null });
          return;
        }

        if (isLoadingProfile) {
          console.log('⏭️  Profile load already in progress, skipping');
          return;
        }

        try {
          console.log("loading profile from load profile");
          set({ isLoadingProfile: true });

          const profile = await createOrGetProfile(user);

          set({
            profile,
            isLoadingProfile: false
          });
          console.log('✅ Profile loaded');

        } catch (error) {
          console.error('Failed to load profile:', error);
          set({ isLoadingProfile: false });
        }
      },

      initialize: () => {

        // Guard against multiple initializations
        if (get().isInitialized) {
          return;
        }

        console.log('Initializing auth store...');
        set({ isInitialized: true });

        // Get initial session
        supabase.auth.getSession().then(async ({ data: { session } }) => {
          set({
            session,
            user: session?.user ?? null,
            isLoading: false,
          });

          if (session?.user) {
            await get().loadProfile();
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

        } catch (error) {
          const authError = error as AuthError;
          set({
            error: authError.message || 'Failed to sign in',
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

        } catch (error) {
          const authError = error as AuthError;
          set({
            error: authError.message || 'Failed to sign up',
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
        } catch (error) {
          const authError = error as AuthError;
          set({
            error: authError.message || 'Failed to sign in with Google',
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

        } catch (error) {
          console.error("Sign out error:", error);
          const authError = error as AuthError;
          set({
            error: authError.message || 'Failed to sign out',
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
        isInitialized: false,
        isLoadingProfile: false,
      }),
    }
  )
);

