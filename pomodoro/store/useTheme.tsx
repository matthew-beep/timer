// store/useModeStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useNotesStore } from './useNotes';
import { fetchUserSettings, saveUserSettings } from '@/lib/userSettings';
import { getCurrentUser } from '@/lib/auth-helpers';

const SETTINGS_DEBOUNCE_MS = 2000;
let themeSettingsSyncTimeout: ReturnType<typeof setTimeout> | null = null;

interface ThemeStore {
  mode: 'work' | 'break';
  backgroundMode: 'mesh' | 'video';
  selectedBackground: number;
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
  updateBackgroundMode: (backgroundMode: 'mesh' | 'video') => void;
  updateSelectedBackground: (backgroundIndex: number) => void;
  _hasHydrated: boolean;
  setHasHydrated: (hasHydrated: boolean) => void;

    // Sync actions
  loadSettingsFromSupabase: () => Promise<void>;
  queueSettingsSync: () => void;
  syncSettingsToSupabase: () => Promise<void>;
}
export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      mode: 'work',
      _hasHydrated: false,
      setHasHydrated: (hasHydrated: boolean) => set({ _hasHydrated: hasHydrated }),
      defaultWork: '#00d3f2',
      backgroundMode: 'mesh',
      defaultBreak: '#f6339a',
      selectedBackground: 0,
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

      updateTheme: (theme: "light" | "dark") => {
        set({ theme: theme });
        get().queueSettingsSync();

      },
      updateBackgroundMode: (backgroundMode: 'mesh' | 'video') => {
        set({ backgroundMode });
        get().queueSettingsSync();
      },
      updateSelectedBackground: (backgroundIndex: number) => {
        set({ selectedBackground: backgroundIndex });
        get().queueSettingsSync();
      },

      // Load settings from Supabase
      loadSettingsFromSupabase: async () => {
        const user = getCurrentUser();
        if (!user) return;

        try {
          const settings = await fetchUserSettings(user.id);
          if (!settings) return;

          set({
            theme: settings.theme_mode,
            backgroundMode: settings.background_mode,
            selectedGradient: settings.selected_gradient,
            selectedBackground: settings.selected_background,
          });
          
          console.log('✅ Loaded theme settings from Supabase');
        } catch (error) {
          console.error('Failed to load theme settings:', error);
        }
      },

      // Queue a sync (debounced)
      queueSettingsSync: () => {
        const user = getCurrentUser();
        if (!user) return;

        if (themeSettingsSyncTimeout) {
          clearTimeout(themeSettingsSyncTimeout);
        }

        themeSettingsSyncTimeout = setTimeout(() => {
          get().syncSettingsToSupabase();
        }, SETTINGS_DEBOUNCE_MS);
      },

      // Sync to Supabase
      syncSettingsToSupabase: async () => {
        const user = getCurrentUser();
        if (!user) return;

        const { theme, backgroundMode, selectedGradient, selectedBackground } = get();

        try {
          await saveUserSettings(user.id, {
            theme_mode: theme,
            background_mode: backgroundMode,
            selected_gradient: selectedGradient,
            selected_background: selectedBackground,
          });
          
          console.log('✅ Synced theme settings to Supabase');
        } catch (error) {
          console.error('Failed to sync theme settings:', error);
        }
      }
    }),

    


    {
      name: 'theme-storage', // unique name for localStorage key
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);