'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/useAuth';
import { useNotesStore } from '@/store/useNotes';
import { supabase } from '@/lib/supabase';
import { useTimer } from '@/store/useTimer';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const initialize = useAuthStore((s) => s.initialize);
    const initializeNotes = useNotesStore((s) => s.initialize);
    const handleSignIn = useNotesStore((s) => s.handleSignIn);
    const hasProcessedInitialSession = useRef(false);

    useEffect(() => {
        // Initialize with error handling
        const initAuth = async () => {
            try {
                // 1. Initialize Auth Store (get session, load profile)
                await initialize();
                
                // 2. Initialize Notes Store (load from Supabase if authenticated)
                await initializeNotes();
            } catch (error: any) {
                console.error('🔥 Auth initialization error:', error);
                
                // Handle refresh token errors gracefully
                if (error?.message?.includes('Refresh Token')) {
                    await supabase.auth.signOut();
                    useAuthStore.setState({ 
                        user: null, 
                        session: null, 
                        isLoading: false,
                        isInitialized: true 
                    });
                }
            }
        };

        initAuth();

        // 3. Setup centralized listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                // Handle INITIAL_SESSION event
                if (event === 'INITIAL_SESSION') {
                    if (session?.user && !hasProcessedInitialSession.current) {
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
                    hasProcessedInitialSession.current = false;
                    
                    // Clear notes
                    useNotesStore.setState({
                        notes: [],
                        hasLoadedFromSupabase: false
                    });
                    
                    // Clear auth
                    useAuthStore.setState({
                        profile: null,
                        session: null,
                        user: null,
                        isLoading: false
                    });
                    
                    // Clean up any stale auth data in localStorage
                    Object.keys(localStorage).forEach(key => {
                        if (key.startsWith('supabase.auth')) {
                            localStorage.removeItem(key);
                        }
                    });
                }
            }
        );

        return () => subscription.unsubscribe();
    }, [initialize, initializeNotes, handleSignIn]);

    return <>{children}</>;
}