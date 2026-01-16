'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/useAuth';
import { useNotesStore } from '@/store/useNotes';
import { supabase } from '@/lib/supabase';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const initialize = useAuthStore((s) => s.initialize);
    const handleSignIn = useNotesStore((s) => s.handleSignIn);
    // Use a ref to track if we've set up the listener to avoid double-mount issues in strict mode
    const isMounted = useRef(false);

    useEffect(() => {
        // 1. Initialize Auth Store (get session, load profile)
        initialize();

        // 2. Setup centralized listener
        // This replaces the listener inside useAuth.tsx store
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            console.log('🔔 AuthProvider Event:', event);

            // Identify internal state changes vs real auth events
            if (event === 'TOKEN_REFRESHED') return;

            if (event === 'SIGNED_IN' && session?.user) {
                // Trigger Notes merger/loading logic
                handleSignIn();
                // Also reload profile if needed (handled by store usually, but we can trigger it)
                useAuthStore.getState().loadProfile();
            }

            if (event === 'SIGNED_OUT') {
                useNotesStore.setState({ notes: [] });
                useAuthStore.setState({ profile: null });
            }
        });

        return () => {
            console.log('🧹 Cleanup AuthProvider listener');
            subscription.unsubscribe();
        };
    }, [initialize, handleSignIn]);

    return <>{children}</>;
}
