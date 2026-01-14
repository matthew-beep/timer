import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * OAuth callback route for handling Google sign-in redirects
 * This route processes the OAuth callback and redirects to the home page
 * 
 * Supabase handles the session automatically via cookies, so we just need to
 * exchange the code and redirect. The client-side auth store will pick up
 * the session automatically.
 */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');

  // Handle OAuth errors
  if (error) {
    console.error('OAuth error:', error, errorDescription);
    // Redirect to home with error (you can customize this)
    const homeUrl = new URL('/', requestUrl.origin);
    homeUrl.searchParams.set('auth_error', error);
    return NextResponse.redirect(homeUrl);
  }

  if (code) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing Supabase environment variables');
      return NextResponse.redirect(new URL('/?auth_error=config', requestUrl.origin));
    }

    try {
      // Create a Supabase client for server-side operations
      const supabase = createClient(supabaseUrl, supabaseAnonKey);

      // Exchange the code for a session
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        console.error('Failed to exchange code for session:', exchangeError);
        return NextResponse.redirect(new URL('/?auth_error=exchange_failed', requestUrl.origin));
      }
    } catch (error) {
      console.error('Error in OAuth callback:', error);
      return NextResponse.redirect(new URL('/?auth_error=callback_error', requestUrl.origin));
    }
  }

  // Redirect to home page on success
  return NextResponse.redirect(new URL('/', requestUrl.origin));
}
