// store/useRoomStore.ts
import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';
import { useTimer } from './useTimer';

interface RoomStore {
  roomCode: string | null;
  isHost: boolean;
  members: string[];
  channel: RealtimeChannel | null;
  
  createRoom: () => Promise<string>;
  joinRoom: (code: string, name: string) => Promise<void>;
  leaveRoom: () => void;
  broadcastStart: () => void;
  broadcastPause: () => void;
  broadcastReset: () => void;
}

export const useRoomStore = create<RoomStore>((set, get) => ({
  roomCode: null,
  isHost: false,
  members: [],
  channel: null,

  createRoom: async () => {
    const code = Array.from({ length: 6 }, () => 
      'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]
    ).join('');

    const channel = supabase.channel(`room:${code}`);
    
    channel
      .on('broadcast', { event: 'timer_start' }, () => {
        useTimer.getState().start();
      })
      .on('broadcast', { event: 'timer_pause' }, () => {
        useTimer.getState().pause();
      })
      .on('broadcast', { event: 'timer_reset' }, () => {
        useTimer.getState().reset();
      })
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const memberNames = Object.values(state).flat().map((p: any) => p.name);
        set({ members: memberNames });
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ name: 'Host' });
        }
      });

    set({ roomCode: code, isHost: true, channel });
    return code;
  },

  joinRoom: async (code: string, name: string) => {
    const channel = supabase.channel(`room:${code}`);
    
    channel
      .on('broadcast', { event: 'timer_start' }, () => {
        useTimer.getState().start();
      })
      .on('broadcast', { event: 'timer_pause' }, () => {
        useTimer.getState().pause();
      })
      .on('broadcast', { event: 'timer_reset' }, () => {
        useTimer.getState().reset();
      })
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const memberNames = Object.values(state).flat().map((p: any) => p.name);
        set({ members: memberNames });
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ name });
        }
      });

    set({ roomCode: code, isHost: false, channel });
  },

  leaveRoom: () => {
    const { channel } = get();
    if (channel) {
      channel.unsubscribe();
    }
    set({ roomCode: null, isHost: false, members: [], channel: null });
  },

  broadcastStart: () => {
    const { channel } = get();
    channel?.send({ type: 'broadcast', event: 'timer_start' });
  },

  broadcastPause: () => {
    const { channel } = get();
    channel?.send({ type: 'broadcast', event: 'timer_pause' });
  },

  broadcastReset: () => {
    const { channel } = get();
    channel?.send({ type: 'broadcast', event: 'timer_reset' });
  },
}));