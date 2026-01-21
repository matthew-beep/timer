import { create } from "zustand";
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

export const useTimer = create<TimerState>((set, get) => ({
  mode: "focus",
  method: POMODORO,
  durations: {...POMODORO.durations },

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
      durations: {...method.durations},
      duration: method.durations.focus,
      timeRemaining: method.durations.focus,
      isRunning: false,
    });
  },

  setPomodoro: () => get().setMethod(POMODORO),
  setCambridge: () => get().setMethod(CAMBRIDGE),

  setMode: (mode) => {
    const { durations } = get();

    if (!(mode in durations)) return; // runtime safety + TS narrowing

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
  updatePomodoroCount: () => set((state) => ({ pomodoroCount: state.pomodoroCount + 1})),
}));
