import { Database, Tables } from '@/types/supabase'; // Adjust path


export interface NoteTagJoinRow {
  tag_id: string | null;
}

// types/index.ts - your application types
export interface Tag {
  id: string;
  name: string;
  color: string | null;     // Changed from string to string | null
  user_id?: string | null;  // Changed to allow null
  created_at?: string | null;
}
export interface NoteTag {
  id: string;
  note_id: string;
  tag_id: string;
  created_at: string;
}

export interface NoteTagRelation {
  tag_id: string;
  tags: Tag | null; // Can be null if tag was deleted
}