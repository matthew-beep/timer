// store/useModeStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeStore {
  mode: 'work' | 'break';
  defaultWork: string;
  defaultBreak: string;
  selectedGradient: number;
  theme: "light" | "dark";
  colors: {
    work: string;
    break: string;
  };
  setMode: (mode: 'work' | 'break') => void;
  updateColor: (mode: 'work' | 'break', color: string) => void;
  toggleMode: () => void;
  updateSelectedGradient: (gradientIndex: number) => void;
  updateTheme: (theme: "light" | "dark") => void;
}
export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      mode: 'work',
      defaultWork: '#00d3f2',
      defaultBreak: '#f6339a',
      selectedGradient: 0,
      theme: "dark",
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
        })
      ),
      updateSelectedGradient: (gradientIndex: number) =>
        set({ selectedGradient: gradientIndex }),

      updateTheme: (theme: "light" | "dark") =>
        set({ theme: theme }),
    }),

      
    {
      name: 'theme-storage', // unique name for localStorage key
    }
  )
);