// store/useModeStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ModeStore {
  mode: 'work' | 'break';
  colors: {
    work: string;
    break: string;
  };
  setMode: (mode: 'work' | 'break') => void;
  updateColor: (mode: 'work' | 'break', color: string) => void;
  toggleMode: () => void;
}

export const useModeStore = create<ModeStore>()(
  persist(
    (set) => ({
      mode: 'work',
      colors: {
        work: '#0066cc',
        break: '#22c55e',
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
    { name: 'mode-settings' }
  )
);