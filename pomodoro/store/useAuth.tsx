import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';
import { createOrGetProfile } from '@/lib/createProfile';
import type { User, Session, AuthError } from '@supabase/supabase-js';
import type { Tables } from '@/types/supabase';
import { telemetry } from '@/lib/telemetry';



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
  initialize: () => Promise<void>;
  clearError: () => void;
  loadProfile: () => Promise<void>;
}




export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      profile: null,
      isLoading: false,
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

        const timer = telemetry.startTimer('auth.profile.load');
        telemetry.track('auth.profile.load.started');

        try {
          console.log("loading profile from load profile");
          set({ isLoadingProfile: true });

          const profile = await createOrGetProfile(user);

          set({
            profile,
            isLoadingProfile: false
          });

          timer.end({ success: true });
          telemetry.track('auth.profile.load.success');
          console.log('✅ Profile loaded');

        } catch (error) {
          timer.end({ success: false, error: (error as Error).message });
          telemetry.trackError(error as Error, { context: 'auth.profile.load' });
          console.error('Failed to load profile:', error);
          set({
            isLoadingProfile: false,
            error: 'Failed to load profile'
          });
        }
      },

      initialize: async () => {
        // Guard against multiple initializations or if already loading
        if (get().isInitialized || get().isLoading) {
          return;
        }

        console.log('Initializing auth store...');
        set({ isLoading: true });

        try {
          // Get initial session
          const { data: { session } } = await supabase.auth.getSession();

          set({
            session,
            user: session?.user ?? null,
          });

          if (session?.user) {
            await get().loadProfile();
          }
        } catch (error) {
          console.error('Auth initialization error:', error);
        } finally {
          console.log('🔓 Init finally block - setting loading: false');
          set({ isInitialized: true, isLoading: false });
        }
      },

      signIn: async (email: string, password: string) => {
        const timer = telemetry.startTimer('auth.sign_in');
        telemetry.track('auth.sign_in.started');

        try {
          set({ isLoading: true, error: null });

          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) throw error;

          timer.end({ success: true });
          telemetry.track('auth.sign_in.success');

        } catch (error) {
          timer.end({ success: false, error: (error as Error).message });
          telemetry.trackError(error as Error, { context: 'auth.sign_in' });

          const authError = error as AuthError;
          set({
            error: authError.message || 'Failed to sign in',
            isLoading: false,
          });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      signUp: async (email: string, password: string, firstName: string, lastName: string) => {
        const timer = telemetry.startTimer('auth.sign_up');
        telemetry.track('auth.sign_up.started');

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

          timer.end({ success: true });
          telemetry.track('auth.sign_up.success');
          console.log("Sign up data:", data);

        } catch (error) {
          timer.end({ success: false, error: (error as Error).message });
          telemetry.trackError(error as Error, { context: 'auth.sign_up' });

          const authError = error as AuthError;
          set({
            error: authError.message || 'Failed to sign up',
            isLoading: false,
          });
          throw error;
        }
      },

      signInWithGoogle: async () => {
        console.log('🔵 signInWithGoogle called');
        try {
          set({ isLoading: true, error: null });

          const redirectUrl = `${window.location.origin}/auth/callback`;
          console.log('Redirecting to:', redirectUrl);

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
        const timer = telemetry.startTimer('auth.sign_out');
        telemetry.track('auth.sign_out.started');

        try {
          set({ isLoading: true, error: null });
          console.log("Signing out...");

          const { error } = await supabase.auth.signOut();

          if (error) throw error;

          timer.end({ success: true });
          telemetry.track('auth.sign_out.success');
          console.log("Sign out complete - auth state change will update store");

        } catch (error) {
          timer.end({ success: false, error: (error as Error).message });
          telemetry.trackError(error as Error, { context: 'auth.sign_out' });

          console.error("Sign out error:", error);
          const authError = error as AuthError;
          set({
            user: null,
            session: null,
            profile: null,
            error: authError.message,
            isLoading: false
          });
          throw error;
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        // Don't persist user - let initialize() fetch it fresh from Supabase
        // user: state.user ? { id: state.user.id } as User : null,
        isInitialized: false,
        isLoadingProfile: false,
      }),
    }
  )
);

