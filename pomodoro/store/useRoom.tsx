import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';
import { createOrGetProfile } from '@/lib/createProfile';
import type { User, Session, AuthError } from '@supabase/supabase-js';
import type { Tables } from '@/types/supabase';
import { telemetry } from '@/lib/telemetry';

type Message = {
  id: string;
  user: User;
  content: string;
  createdAt: Date;
};

interface RoomStore {
  id: string;
  name: string;
  users: User[];
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export const useRoomStore = create<RoomStore>()(
  persist(
    (set, get) => ({
      id: '',
      name: '',
      users: [],
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
    {
      name: 'room-storage',
    }
  )
);

