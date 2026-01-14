import { createClient } from '@supabase/supabase-js';

// Get Supabase URL and anon key from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Validate that environment variables are set (only in development)
if (process.env.NODE_ENV === 'development' && (!supabaseUrl || !supabaseAnonKey)) {
  console.warn(
    '⚠️ Missing Supabase environment variables.\n' +
    'Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.\n' +
    'Copy .env.local.example to .env.local and fill in your credentials.'
  );
}

// Create a single supabase client for the browser
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Automatically refresh the session
    autoRefreshToken: true,
    // Persist the session in localStorage
    persistSession: true,
    // Detect session from URL (for OAuth callbacks)
    detectSessionInUrl: true,
  },
});

// Type helpers for database tables
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      sticky_notes: {
        Row: {
          id: string;
          user_id: string;
          x: number;
          y: number;
          width: number;
          height: number;
          z_index: number;
          text: Record<string, any>; // JSONB
          color: string;
          mode: 'text' | 'draw';
          paths: Record<string, any> | null; // JSONB
          inline_svg: string | null;
          date_created: string;
          last_edited: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          x?: number;
          y?: number;
          width?: number;
          height?: number;
          z_index?: number;
          text?: Record<string, any>;
          color?: string;
          mode?: 'text' | 'draw';
          paths?: Record<string, any> | null;
          inline_svg?: string | null;
          date_created?: string;
          last_edited?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          x?: number;
          y?: number;
          width?: number;
          height?: number;
          z_index?: number;
          text?: Record<string, any>;
          color?: string;
          mode?: 'text' | 'draw';
          paths?: Record<string, any> | null;
          inline_svg?: string | null;
          date_created?: string;
          last_edited?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};
