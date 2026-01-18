// components/ThemeProvider.tsx
"use client";

import { useThemeStore } from "@/store/useTheme";
import { useTimer } from "@/store/useTimer";
import { themes, theme1 } from "@/components/Themes";
import BackgroundRenderer from "@/components/BackgroundRenderer";

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
    // Pull state from Zustand
    const mode = useTimer((s) => s.mode);
    const colors = useThemeStore((s) => s.colors);
    const selectedGradient = useThemeStore((s) => s.selectedGradient);
    const colorTheme = useThemeStore((s) => s.theme);
    const backgroundMode = useThemeStore((s) => s.backgroundMode);
    const hasHydrated = useThemeStore((s) => s._hasHydrated);

    // 1. Logic for Primary Mode Color
    const activeColor = mode === "focus" ? colors.work : colors.break;
    const gradientClass = hasHydrated && backgroundMode === "mesh" ? "gradient-2" : "";

    // 2. Logic for Mesh Gradient (c0-c5)
    // Handle case where selectedGradient might be a string index from storage
    const gradientIdx = typeof selectedGradient === "string" ? 0 : selectedGradient;
    const gradient = theme1[gradientIdx] || theme1[0];

    // 3. Logic for UI Theme (Background, Text, CardBg, etc.)
    const uiTheme = themes[colorTheme];

    // 4. Combine all variables into one object
    const cssVariables = {
        // Timer/Primary Colors
        "--primaryMode": activeColor,
        "--work": colors.work,
        "--break": colors.break,


        // Mesh Gradient Variables
        "--bg": gradient.colors.bg,
        "--c-0": gradient.colors.c0,
        "--c-1": gradient.colors.c1,
        "--c-2": gradient.colors.c2,
        "--c-3": gradient.colors.c3,
        "--c-4": gradient.colors.c4,
        "--c-5": gradient.colors.c5,

        // UI Theme Variables
        "--background": uiTheme.background,
        "--text": uiTheme.text,
        "--cardBg": uiTheme.cardBg,
        "--primary": uiTheme.primary,
        "--secondary": uiTheme.secondary,
        "--border": uiTheme.border,
        "--inputBg": uiTheme.inputBg,
        "--placeholder": uiTheme.placeholder,
        "--stickyHandle": uiTheme.stickyHandle,
        "--stickyBg": uiTheme.stickyBg,
        "--hoverBg": uiTheme.hoverBg,



    } as React.CSSProperties;

    return (
        <div
            style={{
                ...cssVariables,
                transition: hasHydrated ? 'background-color 0.5s ease' : 'none',

            }}
            className={`h-screen flex flex-col font-serif text-white transition-colors duration-500 ${gradientClass}`}
        >
            <BackgroundRenderer />
            {children}
        </div>
    );
}