import { create } from "zustand";

type TimerMode = "focus" | "short" | "long";

interface TimerState {
  mode: TimerMode;
  duration: number; // in seconds
  timeRemaining: number;
  isRunning: boolean;
  setMode: (mode: TimerMode) => void;
  start: () => void;
  pause: () => void;
  reset: () => void;
  tick: () => void;
}

const DURATIONS = {
  focus: 25 * 60,
  short: 5 * 60,
  long: 15 * 60,
};

export const useTimer = create<TimerState>((set, get) => ({
  mode: "focus",
  duration: DURATIONS["focus"],
  timeRemaining: DURATIONS["focus"],
  isRunning: false,

  setMode: (mode) =>
    set(() => ({
      mode,
      duration: DURATIONS[mode],
      timeRemaining: DURATIONS[mode],
      isRunning: false,
    })),

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
      // timer finished
      set({ isRunning: false, timeRemaining: 0 });
      // you could trigger sound, animation, popup, dog animation, etc.
    } else {
      set({ timeRemaining: timeRemaining - 1 });
    }
  },
}));
