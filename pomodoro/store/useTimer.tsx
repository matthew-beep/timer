import { create } from "zustand";
import { persist } from 'zustand/middleware';
import { saveUserSettings } from '@/lib/userSettings';
import { getCurrentUser } from '@/lib/auth-helpers';
import { fetchUserSettings } from '@/lib/userSettings';
import { useThemeStore } from './useTheme';

const SETTINGS_DEBOUNCE_MS = 2000; // 2 seconds
let timerSettingsSyncTimeout: ReturnType<typeof setTimeout> | null = null;

type PomodoroMethod = {
  name: "Pomodoro";
  durations: {
    focus: number;
    short: number;
    long: number;
  };
};

type CambridgeMethod = {
  name: "Cambridge";
  durations: {
    focus: number;
    break: number;
  };
};

type Method = PomodoroMethod | CambridgeMethod;

export const POMODORO = {
  name: "Pomodoro",
  durations: {
    focus: 25 * 60,
    short: 5 * 60,
    long: 15 * 60,
  },
} as const;

export const CAMBRIDGE = {
  name: "Cambridge",
  durations: {
    focus: 52 * 60,
    break: 17 * 60,
  },
} as const;


interface TimerState {
  method: Method;
  setPomodoro: () => void;
  setCambridge: () => void;
  goal: string | null;
  mode: string; // narrowed at runtime
  durations: Record<string, number>;

  duration: number;
  timeRemaining: number;
  isRunning: boolean;

  setMethod: (method: Method) => void;
  setMode: (mode: string) => void;
  setDurationValue: (mode: string, value: number) => void;

  start: () => void;
  pause: () => void;
  reset: () => void;
  tick: () => void;
  complete: () => void;
  justCompleted: boolean;
  clearCompletion: () => void;

  pomodoroCount: number;
  updatePomodoroCount: () => void;

  collapsed: boolean;
  toggleCollapsed: () => void;


    // Sync actions
    loadSettingsFromSupabase: () => Promise<void>;
    queueSettingsSync: () => void;
    syncSettingsToSupabase: () => Promise<void>;
}

export const useTimer = create<TimerState>()(
  persist(
    (set, get) => ({
      mode: "focus",
      method: POMODORO,
      durations: { ...POMODORO.durations },
      goal: null,
      duration: POMODORO.durations.focus,
      timeRemaining: POMODORO.durations.focus,
      isRunning: false,
      collapsed: false,
      toggleCollapsed: () => {
        set((s) => ({ collapsed: !s.collapsed }))
      },

      setMethod: (method) => {
        const defaultMode = "focus";
        set({
          method,
          mode: defaultMode,
          durations: { ...method.durations },
          duration: method.durations.focus,
          timeRemaining: method.durations.focus,
          isRunning: false,
        });
      },

      setPomodoro: () => {
        get().setMethod(POMODORO)
        get().queueSettingsSync();
      },
      setCambridge: () => {
        get().setMethod(CAMBRIDGE)
        get().queueSettingsSync();
      },

      setMode: (mode) => {
        const { durations } = get();
        if (!(mode in durations)) return;
        const d = durations[mode];
        set({
          mode,
          duration: d,
          timeRemaining: d,
          isRunning: false,
        });
      },

      setDurationValue: (mode, valueMinutes) => {
        const seconds = valueMinutes * 60;
        set((s) => ({
          durations: {
            ...s.durations,
            [mode]: seconds,
          },
        }));

        if (get().mode === mode) {
          set({
            duration: seconds,
            timeRemaining: seconds,
          });
        }
        get().queueSettingsSync();
      },

      loadSettingsFromSupabase: async () => {
        const user = getCurrentUser();
        if (!user) return;
        try {
          const settings = await fetchUserSettings(user.id);
          if (!settings) return;

          const currentMode = get().mode;

          set({
            method: settings.timer_method === 'Pomodoro' ? POMODORO : CAMBRIDGE,
            durations: settings.timer_durations,
          });

          if (!get().isRunning) {
            const newDuration = settings.timer_durations[currentMode];
            if (newDuration !== undefined) {
              set({
                duration: newDuration,
                timeRemaining: newDuration,
              });
            }
          }
          
          const themeStore = useThemeStore.getState();
          themeStore.updateColor('work', settings.timer_colors.work);
          themeStore.updateColor('break', settings.timer_colors.break);
          console.log('✅ Loaded timer settings from Supabase');
        } catch (error) {
          console.error('Failed to load timer settings:', error);
        }
      },

      queueSettingsSync: () => {
        const user = getCurrentUser();
        if (!user) return;
        if (timerSettingsSyncTimeout) {
          clearTimeout(timerSettingsSyncTimeout);
        }
        timerSettingsSyncTimeout = setTimeout(() => {
          get().syncSettingsToSupabase();
        }, SETTINGS_DEBOUNCE_MS);
      },

      syncSettingsToSupabase: async () => {
        const user = getCurrentUser();
        if (!user) return;
        const { method, durations } = get();
        const themeStore = useThemeStore.getState();
        try {
          await saveUserSettings(user.id, {
            timer_method: method.name,
            timer_durations: durations,
            timer_colors: themeStore.colors,
          });
          console.log('✅ Synced timer settings to Supabase');
        } catch (error) {
          console.error('Failed to sync timer settings:', error);
        }
      },

      start: () => set({ isRunning: true }),
      pause: () => set({ isRunning: false }),
      reset: () =>
        set((state) => ({
          timeRemaining: state.duration,
          isRunning: false,
        })),

      tick: () => {
        const { timeRemaining, isRunning } = get();
        if (!isRunning) return;
        if (timeRemaining <= 1) {
          set({ isRunning: false, timeRemaining: 0, justCompleted: true });
        } else {
          set({ timeRemaining: timeRemaining - 1 });
        }
      },

      complete: () => {
        const { mode, method, pomodoroCount } = get();
        if (method.name === "Pomodoro") {
          if (mode === "focus") {
            const next = pomodoroCount + 1;
            const isLong = next % 4 === 0;
            set({ pomodoroCount: next });
            get().setMode(isLong ? "long" : "short");
          } else {
            get().setMode("focus");
          }
        }
        if (method.name === "Cambridge") {
          get().setMode(mode === "focus" ? "break" : "focus");
        }
      },

      justCompleted: false,
      clearCompletion: () => set({ justCompleted: false }),
      pomodoroCount: 0,
      updatePomodoroCount: () => set((state) => ({ pomodoroCount: state.pomodoroCount + 1 })),
    }),
    {
      name: "timer-settings",
      partialize: (state) => ({ 
        method: state.method, 
        durations: state.durations 
      }),
    }
  )
);
