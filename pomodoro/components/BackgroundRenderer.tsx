"use client";

import { useThemeStore } from "@/store/useTheme";
import { BACKGROUND_CONFIGS } from "@/config/BackgroundConfig";
import { useState } from "react";
import Image from "next/image";

export default function BackgroundRenderer() {
    const selectedBackground = useThemeStore((s) => s.selectedBackground);
    const backgroundMode = useThemeStore((s) => s.backgroundMode);
    const [isVideoLoaded, setIsVideoLoaded] = useState(false);

    if (backgroundMode !== "video") return null;

    const currentBg = BACKGROUND_CONFIGS[selectedBackground];

    return (
        <div className="fixed inset-0 -z-10 overflow-hidden bg-background">
            {/* Thumbnail image - shows immediately */}
            {currentBg.thumbnail && (
                <div 
                    className={`absolute inset-0 transition-opacity duration-700 ${
                        isVideoLoaded ? 'opacity-0 pointer-events-none' : 'opacity-100'
                    }`}
                >
                    <Image
                        src={currentBg.thumbnail}
                        alt=""
                        fill
                        className="object-cover"
                        priority
                        quality={75}
                    />
                </div>
            )}

            {/* Video - fades in when loaded */}
            <video
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                key={selectedBackground}
                onCanPlayThrough={() => setIsVideoLoaded(true)}
                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
                    isVideoLoaded ? 'opacity-100' : 'opacity-0'
                }`}
            >
                <source src={`${currentBg.path}#t=0.1`} type="video/mp4" />
            </video>

            <div className="absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-background/30 to-transparent pointer-events-none" />
        </div>
    );
}