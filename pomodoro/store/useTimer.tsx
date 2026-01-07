import { create } from "zustand";

type TimerMode = "focus" | "short" | "long";

interface TimerState {
  mode: TimerMode;

  // Store user-editable durations
  durations: {
    focus: number;
    short: number;
    long: number;
  };

  duration: number;
  timeRemaining: number;
  isRunning: boolean;

  // actions
  setMode: (mode: TimerMode) => void;
  setDurationValue: (mode: TimerMode, value: number) => void;
  start: () => void;
  pause: () => void;
  reset: () => void;
  tick: () => void;

  pomodoroCount: number;
  updatePomodoroCount: () => void;
}

export const useTimer = create<TimerState>((set, get) => ({
  mode: "focus",

  durations: {
    focus: 25 * 60,
    short: 5 * 60,
    long: 15 * 60,
  },

  duration: 25 * 60,
  timeRemaining: 25 * 60,
  isRunning: false,

  setMode: (mode) => {
    const d = get().durations[mode];
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

    // If you're editing the active mode, update duration + reset timer
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
      set({ isRunning: false, timeRemaining: 0 });
    } else {
      set({ timeRemaining: timeRemaining - 1 });
    }
  },

  pomodoroCount: 0,
  updatePomodoroCount: () => set((state) => ({ pomodoroCount: state.pomodoroCount + 1})),
}));
