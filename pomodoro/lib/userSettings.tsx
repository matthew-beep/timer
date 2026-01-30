import { supabase } from '@/lib/supabase';

export interface TimerSettings {
    timer_method: 'Pomodoro' | 'Cambridge';
    timer_durations: Record<string, number>;
    timer_colors: { work: string; break: string };
}

export interface ThemeSettings {
    theme_mode: 'dark' | 'light';
    background_mode: 'mesh' | 'video';
    selected_gradient: number;
    selected_background: number;
}

export type UserSettings = TimerSettings & ThemeSettings & {
    user_id: string;
};

// Fetch settings
export async function fetchUserSettings(userId: string) {
    const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
}

// Save/update settings (upsert)
export async function saveUserSettings(
    userId: string,
    settings: Partial<TimerSettings & ThemeSettings>
) {
    const { data, error } = await supabase
        .from('user_settings')
        .upsert({
            user_id: userId,
            ...settings,
        },{
            onConflict: 'user_id', // ← This is the key!
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}