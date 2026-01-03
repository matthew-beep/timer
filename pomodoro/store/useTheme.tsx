// store/useModeStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeStore {
  mode: 'work' | 'break';
  colors: {
    work: string;
    break: string;
  };
  setMode: (mode: 'work' | 'break') => void;
  updateColor: (mode: 'work' | 'break', color: string) => void;
  toggleMode: () => void;
}

export const useThemeStore = create<ThemeStore>()(
    // default work": "#00d3f2", "break": "#f6339a"
    (set) => ({
      mode: 'work',
      colors: {
        work: '#00d3f2',
        break: '#f6339a',
      },
      setMode: (mode) => set({ mode }),
      updateColor: (mode, color) =>
        set((state) => ({
          colors: { ...state.colors, [mode]: color },
        })),
      toggleMode: () =>
        set((state) => ({
          mode: state.mode === 'work' ? 'break' : 'work',
        })),
    }),

);