"use client";

import { useThemeStore } from "@/store/useTheme";
import { BACKGROUND_CONFIGS } from "@/config/BackgroundConfig";

export default function BackgroundRenderer() {
    const selectedBackground = useThemeStore((s) => s.selectedBackground);
    const backgroundMode = useThemeStore((s) => s.backgroundMode);

    if (backgroundMode !== "video") return null;

    return (
        <div className="fixed inset-0 -z-10 overflow-hidden">
            <video
                autoPlay
                loop
                muted
                playsInline
                key={selectedBackground}
                className="h-full w-full object-cover transition-opacity duration-1000"
            >
                <source src={`${BACKGROUND_CONFIGS[selectedBackground].path}`} type="video/mp4" />
            </video>

            <div className="absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-background/30 to-transparent pointer-events-none" />
        </div>
    );
}
