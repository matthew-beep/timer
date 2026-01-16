'use client';
import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/useAuth';
import { useNotesStore } from '@/store/useNotes';
import { supabase } from '@/lib/supabase';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const initialize = useAuthStore((s) => s.initialize);
    const initializeNotes = useNotesStore((s) => s.initialize);
    const handleSignIn = useNotesStore((s) => s.handleSignIn);
    const hasProcessedInitialSession = useRef(false);

    useEffect(() => {
        // 1. Initialize Auth Store (get session, load profile)
        initialize();

        // 2. Initialize Notes Store (load from Supabase if authenticated)
        initializeNotes();

        // 3. Setup centralized listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            console.log('🔔 AuthProvider Event:', event, 'Session:', !!session?.user);

            // ✅ CRITICAL: Handle INITIAL_SESSION event
            // This fires when the page loads and a session exists
            if (event === 'INITIAL_SESSION') {
                if (session?.user && !hasProcessedInitialSession.current) {
                    console.log('🔵 Processing initial session for:', session.user.email);
                    hasProcessedInitialSession.current = true;

                    // Update auth store
                    useAuthStore.setState({
                        session,
                        user: session.user,
                        isLoading: false,
                        isInitialized: true,
                    });

                    // Load profile
                    useAuthStore.getState().loadProfile();

                    // Handle notes (merge or load)
                    handleSignIn();
                }
                return;
            }

            // Skip token refresh events
            if (event === 'TOKEN_REFRESHED') return;

            if (event === 'SIGNED_IN' && session?.user) {
                console.log('🟢 SIGNED_IN event for:', session.user.email);

                useAuthStore.setState({
                    session,
                    user: session.user,
                    isLoading: false
                });

                // Trigger Notes merger/loading logic
                handleSignIn();

                // Reload profile
                useAuthStore.getState().loadProfile();
            }

            if (event === 'SIGNED_OUT') {
                console.log('🔴 SIGNED_OUT event');
                hasProcessedInitialSession.current = false;

                useNotesStore.setState({
                    notes: [],
                    hasLoadedFromSupabase: false
                });

                useAuthStore.setState({
                    profile: null,
                    session: null,
                    user: null,
                    isLoading: false
                });
            }
        });

        return () => {
            console.log('🧹 Cleanup AuthProvider listener');
            subscription.unsubscribe();
        };
    }, [initialize, initializeNotes, handleSignIn]);

    return <>{children}</>;
}