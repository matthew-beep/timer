import { create } from "zustand";
import { persist } from 'zustand/middleware';
import { saveUserSettings } from '@/lib/userSettings';
import { getCurrentUser } from '@/lib/auth-helpers';

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
      pomodoroCount: 0,
      justCompleted: false,

      toggleCollapsed: () => {
        set((s) => ({ collapsed: !s.collapsed }));
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

      setPomodoro: () => get().setMethod(POMODORO),
      setCambridge: () => get().setMethod(CAMBRIDGE),

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

      clearCompletion: () => set({ justCompleted: false }),
      updatePomodoroCount: () =>
        set((state) => ({ pomodoroCount: state.pomodoroCount + 1 })),
    }),
    {
      name: 'timer-settings',
      partialize: (state) => ({
        method: state.method,
        durations: state.durations,
      }),
    }
  )
);
