// app/auth/confirmed/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useThemeStore } from '@/store/useTheme';

export default function ConfirmedPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const theme = useThemeStore((s) => s.theme);
  useEffect(() => {
    // Check if we have a session (email was confirmed)
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (session) {
        console.log('✅ Email confirmed, session exists');
        setStatus('success');
        
        // Notify other tabs
        localStorage.setItem('email_confirmed', Date.now().toString());
        
        // Auto-redirect after showing success
        setTimeout(() => {
          router.push('/');
        }, 3000);
      } else if (error) {
        console.error('❌ Session check error:', error);
        setStatus('error');
      }
    };

    checkSession();

    // Also listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        console.log('✅ Signed in via auth state change');
        setStatus('success');
        
        setTimeout(() => {
          router.push('/');
        }, 3000);
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Confirming your email...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-red-100 rounded-full p-4">
              <svg className="w-16 h-16 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Confirmation Failed
          </h1>
          <p className="text-gray-600 mb-6">
            There was a problem confirming your email. The link may have expired.
          </p>
          <button
            onClick={() => router.push('/')}
            className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-green-100 rounded-full p-4 animate-bounce">
            <svg className="w-16 h-16 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Welcome! 🎉
        </h1>
        
        <p className="text-gray-600 mb-2">
          Your email has been confirmed successfully!
        </p>
        
        <p className="text-sm text-gray-500 mb-8">
          Redirecting you to the app in 3 seconds...
        </p>
        
        <button
          onClick={() => router.push('/')}
          className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
        >
          Go to App Now →
        </button>
      </div>
    </div>
  );
}