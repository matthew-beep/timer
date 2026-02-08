// app/auth/confirmed/ConfirmedContent.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function ConfirmedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        const token_hash = searchParams.get('token_hash');
        const type = searchParams.get('type');

        if (token_hash && type) {
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash,
            type: 'email',
          });

          if (error) throw error;

          setStatus('success');

          localStorage.setItem('email_confirmed', Date.now().toString());

          setTimeout(() => {
            router.push('/');
          }, 2000);
        } else {
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session) {
            setStatus('success');
            setTimeout(() => {
              router.push('/');
            }, 2000);
          } else {
            throw new Error('No confirmation token found in URL');
          }
        }
      } catch (error) {
        console.error('❌ Email confirmation error:', error);
        setStatus('error');
        setErrorMessage((error as Error).message || 'Failed to confirm email');
      }
    };

    handleEmailConfirmation();
  }, [router, searchParams]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text">Confirming your email...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="bg-cardBg p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-border">
          <div className="flex justify-center mb-6">
            <div className="bg-red-500/20 rounded-full p-4">
              <svg className="w-16 h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-text mb-4">
            Confirmation Failed
          </h1>
          <p className="text-text/70 mb-2">
            {errorMessage || 'There was a problem confirming your email.'}
          </p>
          <p className="text-text/50 text-sm mb-6">
            The link may have expired or already been used.
          </p>
          <button
            onClick={() => router.push('/')}
            className="w-full px-4 py-3 bg-primary text-white rounded-lg hover:opacity-80 transition-opacity font-medium"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="bg-cardBg p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-border">
        <div className="flex justify-center mb-6">
          <div className="bg-green-500/20 rounded-full p-4 animate-bounce">
            <svg className="w-16 h-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-text mb-4">
          Welcome! 🎉
        </h1>
        
        <p className="text-text/70 mb-2">
          Your email has been confirmed successfully!
        </p>
        
        <p className="text-sm text-text/50 mb-8">
          Redirecting you to the app...
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
