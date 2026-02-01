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
  endRoom: () => void;
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
    console.log('[Room] Creating room...');
    const code = Array.from({ length: 6 }, () =>
      'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]
    ).join('');

    const channel = supabase.channel(`room:${code}`);

    channel
      .on('broadcast', { event: 'timer_start' }, () => {
        console.log('[Room] Received broadcast: timer_start');
        useTimer.getState().start();
      })
      .on('broadcast', { event: 'timer_pause' }, () => {
        console.log('[Room] Received broadcast: timer_pause');
        useTimer.getState().pause();
      })
      .on('broadcast', { event: 'timer_reset' }, () => {
        console.log('[Room] Received broadcast: timer_reset');
        useTimer.getState().reset();
      })
      .on('broadcast', { event: 'room_ended' }, () => {
        console.log('[Room] Received broadcast: room_ended');
        get().leaveRoom();
        alert("The host has ended the room.");
      })
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const memberNames = Object.values(state).flat().map((p: any) => p.name);
        console.log('[Room] Presence sync:', memberNames);
        set({ members: memberNames });
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`[Room] Subscribed to room:${code} as Host`);
          await channel.track({ name: 'Host' });
        }
      });

    set({ roomCode: code, isHost: true, channel });
    console.log(`[Room] Room created with code: ${code}`);
    return code;
  },

  joinRoom: async (code: string, name: string) => {
    console.log(`[Room] Joining room: ${code} as ${name}`);
    const channel = supabase.channel(`room:${code}`);

    channel
      .on('broadcast', { event: 'timer_start' }, () => {
        console.log('[Room] Received broadcast: timer_start');
        useTimer.getState().start();
      })
      .on('broadcast', { event: 'timer_pause' }, () => {
        console.log('[Room] Received broadcast: timer_pause');
        useTimer.getState().pause();
      })
      .on('broadcast', { event: 'timer_reset' }, () => {
        console.log('[Room] Received broadcast: timer_reset');
        useTimer.getState().reset();
      })
      .on('broadcast', { event: 'room_ended' }, () => {
        console.log('[Room] Received broadcast: room_ended');
        get().leaveRoom();
        alert("The host has ended the room.");
      })
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const memberNames = Object.values(state).flat().map((p: any) => p.name);
        console.log('[Room] Presence sync:', memberNames);
        set({ members: memberNames });
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`[Room] Subscribed to room:${code}`);
          await channel.track({ name });
        }
      });

    set({ roomCode: code, isHost: false, channel });
  },

  leaveRoom: () => {
    console.log('[Room] Leaving room...');
    const { channel } = get();
    if (channel) {
      channel.unsubscribe();
    }
    set({ roomCode: null, isHost: false, members: [], channel: null });
  },

  endRoom: () => {
    console.log('[Room] Ending room...');
    const { channel, leaveRoom } = get();
    if (channel) {
      channel.send({ type: 'broadcast', event: 'room_ended' });
    }
    leaveRoom();
  },

  broadcastStart: () => {
    console.log('[Room] Broadcasting: timer_start');
    const { channel } = get();
    channel?.send({ type: 'broadcast', event: 'timer_start' });
  },

  broadcastPause: () => {
    console.log('[Room] Broadcasting: timer_pause');
    const { channel } = get();
    channel?.send({ type: 'broadcast', event: 'timer_pause' });
  },

  broadcastReset: () => {
    console.log('[Room] Broadcasting: timer_reset');
    const { channel } = get();
    channel?.send({ type: 'broadcast', event: 'timer_reset' });
  },
}));