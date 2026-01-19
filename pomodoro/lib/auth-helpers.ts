/**
 * Shared auth helper functions to avoid circular dependencies
 * between stores.
 */

import { useAuthStore } from '@/store/useAuth';

/**
 * Get the current authenticated user from the auth store.
 * Safe to call from server-side (returns null).
 */
export const getCurrentUser = () => {
    if (typeof window === 'undefined') return null;
    return useAuthStore.getState().user;
};

/**
 * Get the current session from the auth store.
 * Safe to call from server-side (returns null).
 */
export const getCurrentSession = () => {
    if (typeof window === 'undefined') return null;
    return useAuthStore.getState().session;
};
