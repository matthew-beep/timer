// store/useRoomStore.ts
import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';
import { useTimer } from './useTimer';

const SESSION_KEY = 'room_session';

interface TimerState {
  mode: string;
  duration: number;
  timeRemaining: number;
  isRunning: boolean;
  method: { name: string };
}

interface RoomSettings {
  isPrivate: boolean;
  maxMembers: number;
  allowGuestControl: boolean;
  roomName?: string; // 👈 Bundled room name
}

interface RoomSession {
  roomCode: string;
  roomName: string;
  isHost: boolean;
  roomSettings: RoomSettings;
  memberName: string; // Needed for re-tracking
}

interface RoomStore {
  roomCode: string | null;
  isHost: boolean;
  members: string[];
  channel: RealtimeChannel | null;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  roomSettings: RoomSettings;
  lastSync: TimerState | null;
  roomName: string | null;
  userName: string | null; // 👈 Track current user's name

  createRoom: (hostName?: string, roomName?: string, roomsettings?: Partial<RoomSettings>) => Promise<string>;
  joinRoom: (code: string, name: string) => Promise<void>;
  leaveRoom: () => void;
  endRoom: () => void;
  restoreSession: () => Promise<void>;

  // Enhanced broadcast methods
  broadcastStart: () => void;
  broadcastPause: () => void;
  broadcastReset: () => void;
  broadcastTimerState: (state: TimerState) => void;

  // Room management
  updateSettings: (settings: Partial<RoomSettings>) => void;
  kickMember: (memberName: string) => void;
}

// Helper to save session
const saveSession = (session: RoomSession) => {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  // Keep legacy keys for backward compat if needed, or remove them
  localStorage.setItem('roomCode', session.roomCode);
  localStorage.setItem('roomName', session.roomName);
};

// Helper to clear session
const clearSession = () => {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem('roomCode');
  localStorage.removeItem('roomName');
};

const setupChannelListeners = (
  channel: RealtimeChannel,
  setState: (state: Partial<RoomStore>) => void,
  getState: () => RoomStore,
  isHost: boolean,
  memberName?: string
): RealtimeChannel => {
  return channel
    .on('broadcast', { event: 'timer_start' }, () => {
      useTimer.getState().start();
    })
    .on('broadcast', { event: 'timer_pause' }, () => {
      useTimer.getState().pause();
    })
    .on('broadcast', { event: 'timer_reset' }, () => {
      useTimer.getState().reset();
    })
    .on('broadcast', { event: 'timer_state' }, (payload: { payload: TimerState }) => {
      const timerState = useTimer.getState();

      // Sync state if not currently running (or forced sync)
      // If host says running, we should match it
      if (!timerState.isRunning && payload.payload.isRunning) {
        // Update time first
        useTimer.setState({
          timeRemaining: payload.payload.timeRemaining,
          mode: payload.payload.mode,
          duration: payload.payload.duration
        });
        // Then start
        timerState.start();
      } else if (!timerState.isRunning) {
        // Just sync values
        timerState.setMode(payload.payload.mode);
        if (timerState.duration !== payload.payload.duration) {
          timerState.setDurationValue(payload.payload.mode, payload.payload.duration / 60);
        }
        if (timerState.timeRemaining !== payload.payload.timeRemaining) {
          useTimer.setState({ timeRemaining: payload.payload.timeRemaining });
        }
      }
    })
    // ❌ Removed separate 'room_name' listener in favor of bundled settings
    .on('broadcast', { event: 'room_settings' }, (payload: { payload: RoomSettings }) => {
      // Host is authority, should not receive settings updates usually, but good for sync
      if (!isHost) {
        const newSettings = payload.payload;
        setState({
          roomSettings: newSettings,
          roomName: newSettings.roomName ?? getState().roomName // Sync roomName from settings
        });

        // Update stored session with new settings
        const currentSession = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
        if (currentSession) {
          saveSession({
            ...currentSession,
            roomSettings: newSettings,
            roomName: newSettings.roomName ?? currentSession.roomName
          });
        }
      }
    })
    .on('broadcast', { event: 'member_kicked' }, (payload: { payload: { memberName: string } }) => {
      if (memberName === payload.payload.memberName) {
        getState().leaveRoom();
        alert("You have been removed from the room.");
      }
    })
    .on('broadcast', { event: 'room_ended' }, () => {
      getState().leaveRoom();
      alert("The host has ended the room.");
    })
    .on('presence', { event: 'sync' }, () => {
      const presence = channel.presenceState() as Record<string, Array<{ name?: string }>>;
      const memberNames = Object.values(presence)
        .flat()
        .map((p) => p.name)
        .filter((n): n is string => Boolean(n));

      setState({ members: memberNames });
    })
    // Host-only: Listen for sync requests from new/refreshing guests
    .on('broadcast', { event: 'request_timer_state' }, () => {
      if (isHost) {
        const state = getState();
        const timerState = useTimer.getState();

        // 1. Send Room Settings (includes roomName)
        channel.send({
          type: 'broadcast',
          event: 'room_settings',
          payload: {
            ...state.roomSettings,
            roomName: state.roomName ?? undefined
          }
        });

        // 2. Send Timer State
        channel.send({
          type: 'broadcast',
          event: 'timer_state',
          payload: timerState
        });
      }
    });
};

export const useRoomStore = create<RoomStore>((set, get) => ({
  roomCode: null,
  roomName: null,
  userName: null, // 👈 Initialize
  isHost: false,
  members: [],
  channel: null,
  connectionStatus: 'disconnected',
  roomSettings: {
    isPrivate: false,
    maxMembers: 10,
    allowGuestControl: true,
  },
  lastSync: null,

  createRoom: async (hostName = 'Host', roomName = 'Study Room', settings = {}) => {
    set({ connectionStatus: 'connecting' });

    const code = Array.from({ length: 6 }, () =>
      'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]
    ).join('');

    // Bundle roomName into settings
    const finalSettings: RoomSettings = {
      ...get().roomSettings,
      ...settings,
      roomName // 👈 Source of truth
    };

    const channel = supabase.channel(`room:${code}`);

    setupChannelListeners(channel, set, get, true);

    channel.subscribe(async (status: string) => {
      if (status === 'SUBSCRIBED') {
        set({ connectionStatus: 'connected' });
        await channel.track({ name: hostName, isHost: true });

        // Broadcast initial room settings (including roomName)
        channel.send({
          type: 'broadcast',
          event: 'room_settings',
          payload: finalSettings
        });

        // ❌ No separate room_name broadcast needed
      } else if (status === 'CHANNEL_ERROR') {
        set({ connectionStatus: 'error' });
      }
    });

    const newData = {
      roomCode: code,
      roomName,
      userName: hostName, // 👈 Set userName
      isHost: true,
      channel,
      roomSettings: finalSettings
    };

    set(newData);

    // Save session for refresh
    saveSession({
      roomCode: code,
      roomName,
      isHost: true,
      roomSettings: finalSettings,
      memberName: hostName
    });

    return code;
  },

  joinRoom: async (code: string, name: string) => {
    set({ connectionStatus: 'connecting' });

    const channel = supabase.channel(`room:${code}`);
    setupChannelListeners(channel, set, get, false, name);

    channel.subscribe(async (status: string) => {
      if (status === 'SUBSCRIBED') {
        set({ connectionStatus: 'connected' });
        await channel.track({ name, isHost: false });

        // Request current timer state and settings
        channel.send({
          type: 'broadcast',
          event: 'request_timer_state'
        });
      } else if (status === 'CHANNEL_ERROR') {
        set({ connectionStatus: 'error' });
        throw new Error('Failed to join room');
      }
    });

    // Initially we might not know the room name until we get the broadcast
    // But if we are restoring session, we might have it provided
    set({
      roomCode: code,
      isHost: false,
      channel,
      roomName: get().roomName, // Keep existing if restoring
      userName: name // 👈 Set userName
    });

    // Save session (optimistic, will update with true name later)
    saveSession({
      roomCode: code,
      roomName: get().roomName || 'Full Focus Room', // Default until sync
      isHost: false,
      roomSettings: get().roomSettings,
      memberName: name
    });
  },

  leaveRoom: () => {
    const { channel } = get();
    if (channel) {
      channel.unsubscribe();
    }
    clearSession(); // 👈 Clear session logic
    set({
      roomCode: null,
      isHost: false,
      members: [],
      channel: null,
      connectionStatus: 'disconnected',
      lastSync: null,
      roomName: null,
      userName: null // 👈 Clear
    });
  },

  endRoom: () => {
    const { channel, leaveRoom } = get();
    if (channel) {
      channel.send({ type: 'broadcast', event: 'room_ended' });
    }
    leaveRoom();
  },

  broadcastStart: () => {
    const { channel } = get();
    channel?.send({ type: 'broadcast', event: 'timer_start' });
    get().broadcastTimerState(useTimer.getState());
  },

  broadcastPause: () => {
    const { channel } = get();
    channel?.send({ type: 'broadcast', event: 'timer_pause' });
    get().broadcastTimerState(useTimer.getState());
  },

  broadcastReset: () => {
    const { channel } = get();
    channel?.send({ type: 'broadcast', event: 'timer_reset' });
    get().broadcastTimerState(useTimer.getState());
  },

  broadcastTimerState: (state: TimerState) => {
    const { channel } = get();
    channel?.send({
      type: 'broadcast',
      event: 'timer_state',
      payload: state
    });
    set({ lastSync: state });
  },

  updateSettings: (settings: Partial<RoomSettings>) => {
    const { channel, isHost, roomSettings, roomName } = get();
    if (!isHost) {
      console.warn('[Room] Only host can update room settings');
      return;
    }

    // Bundle roomName into settings if not provided in update, but it should be part of State
    // If settings has roomName, it updates the "Name" of the room too? Currently roomName is separate state but bundled in payload.
    // Let's ensure consistency.

    const newSettings = {
      ...roomSettings,
      ...settings,
      roomName: roomName || undefined // Ensure roomName is attached if not updating it
    };

    set({ roomSettings: newSettings });

    // Update session
    const currentSession = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
    if (currentSession) {
      saveSession({
        ...currentSession,
        roomSettings: newSettings
      });
    }

    if (channel) {
      channel.send({
        type: 'broadcast',
        event: 'room_settings',
        payload: newSettings
      });
    }
  },

  kickMember: (memberName: string) => {
    const { channel, isHost } = get();
    if (!isHost) {
      console.warn('[Room] Only host can kick members');
      return;
    }

    if (channel) {
      channel.send({
        type: 'broadcast',
        event: 'member_kicked',
        payload: { memberName }
      });
    }
  },

  restoreSession: async () => {
    if (typeof window === 'undefined') return;

    const sessionStr = localStorage.getItem(SESSION_KEY);
    if (!sessionStr) return;

    try {
      const session: RoomSession = JSON.parse(sessionStr);

      // 1. Hydrate State immediately
      set({
        roomCode: session.roomCode,
        roomName: session.roomName,
        userName: session.memberName, // 👈 Restore userName
        isHost: session.isHost,
        roomSettings: session.roomSettings,
        connectionStatus: 'connecting'
      });

      // 2. Re-connect Channel
      const channel = supabase.channel(`room:${session.roomCode}`);

      // Setup listeners (Host vs Guest)
      setupChannelListeners(channel, set, get, session.isHost, session.memberName);

      channel.subscribe(async (status: string) => {
        if (status === 'SUBSCRIBED') {
          set({ connectionStatus: 'connected' });

          await channel.track({
            name: session.memberName,
            isHost: session.isHost
          });

          if (session.isHost) {
            channel.send({
              type: 'broadcast',
              event: 'room_settings',
              payload: session.roomSettings
            });
            // Also broadcast timer logic if valid? 
            // Might be better to let timer component trigger this or wait for user interaction,
            // but broadcasting current state is safe.
            const timerState = useTimer.getState();
            channel.send({
              type: 'broadcast',
              event: 'timer_state',
              payload: timerState
            });

          } else {
            channel.send({
              type: 'broadcast',
              event: 'request_timer_state'
            });
          }
        }
      });

      set({ channel });

    } catch (e) {
      console.error('[Room] Failed to restore session', e);
      clearSession();
    }
  }
}));