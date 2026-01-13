"use client";

import Timer from "@/components/Timer";
import Header from "@/components/Header";
import { useNotesStore } from "@/store/useNotes";
import StickyNote from "@/components/Sticky";
import { PetRenderer } from "@/components/Pet";
import ProgressBar from "@/components/Progress";
import Settings from "@/components/Settings";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useTimer } from "@/store/useTimer";
import { useThemeStore } from "@/store/useTheme";
import { Theme, theme1, themes} from "@/components/Themes";
import { BACKGROUND_CONFIGS } from "@/config/BackgroundConfig";

import NotesList from "@/components/NotesList"; 
export default function Home() {
  const notes = useNotesStore((s) => s.notes);
  const [showSettings, setShowSettings] = useState(false);
  const mode = useTimer((s) => s.mode);
  const colors = useThemeStore((s) => s.colors);
  const selectedGradient = useThemeStore((s) => s.selectedGradient);
  const viewMode = useNotesStore((s) => s.viewMode);
  const updateViewMode = useNotesStore((s) => s.updateViewMode);
  const colorTheme = useThemeStore((s) => s.theme);

  const selectedBackground = useThemeStore((s) => s.selectedBackground);  
  const backgroundMode = useThemeStore((s) => s.backgroundMode);

  const applyTheme = (themeIndex: number) => {
    const theme = theme1[themeIndex];
    console.log("gradient object: ", theme);
    const gradientElement = document.querySelector('.gradient-2') as HTMLElement;
    gradientElement.style.setProperty('--bg', theme.colors.bg)
    gradientElement.style.setProperty('--c-0', theme.colors.c0)
    gradientElement.style.setProperty('--c-1', theme.colors.c1)
    gradientElement.style.setProperty('--c-2', theme.colors.c2)
    gradientElement.style.setProperty('--c-3', theme.colors.c3)
    gradientElement.style.setProperty('--c-4', theme.colors.c4)
    gradientElement.style.setProperty('--c-5', theme.colors.c5)
  }

  useEffect(() => { 
    const activeColor = mode === "focus" ? colors.work : colors.break;
    console.log("current color: ", document.documentElement.style.getPropertyValue("--primaryMode"));
    document.documentElement.style.setProperty("--primaryMode", activeColor);
  }, [mode, colors.work, colors.break]);
  
  useEffect(() => {
    // Small delay ensures localStorage has been read

    console.log("selectedGradient changed: ", selectedGradient);


    if (backgroundMode == "mesh") {
          console.log("switch to gradient: ");

      if (typeof selectedGradient === "string") {
        applyTheme(0);
      } else {
        applyTheme(selectedGradient);
      }
    }


  }, [selectedGradient, backgroundMode]);
  
  const applyColorTheme = (themeMode: 'light' | 'dark') => {
    const currentTheme = themes[themeMode];
    const root = document.documentElement;
    
    Object.entries(currentTheme).forEach(([key, value]) => {
      console.log(`Applying ${key}: ${value}`);
      root.style.setProperty(`--${key}`, value);
    });
  };

  useEffect(() => {
    applyColorTheme(colorTheme);
    console.log("switching mode: ", colorTheme);

  }, [colorTheme]);




  

  return (
    <div 
      className={`font-serif h-screen flex flex-col text-white ${backgroundMode === "mesh" ? "gradient-2" : ""}`}
    >
      {backgroundMode == "video" &&
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
}
      <Header showSettings={showSettings} setShowSettings={setShowSettings}/>
      <div className="relative h-full">
        <div className="absolute top-0 left-0 w-full h-full z-10 pointer-events-none overflow-hidden">
          {viewMode === 'grid' ? (
            notes.map((note) => (
              <StickyNote key={note.id} mode={note.mode} text={note.text} id={note.id} color={note.color} x={note.x} y={note.y} width={note.width} height={note.height} paths={note.paths} zIndex={note.zIndex} inlineSvg={note.inlineSvg} dateCreated={note.dateCreated} lastEdited={note.lastEdited}/>
            ))
          ) : (
            <NotesList showList={viewMode === "list"} setShowList={updateViewMode}/>
          )}
        </div>
        
        <div 
          className="w-fit mx-auto flex flex-col items-center justify-center h-full z-0 relative p-10"
          >
            <div className="w-full h-full relative">
              <PetRenderer id="turtle" scale={1}/>
              <PetRenderer id="rottweiler" scale={2}/>
            </div>
            <Timer />
            <div className="w-full h-full"></div>
          
        </div>

              <AnimatePresence>
        {showSettings && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSettings(false)}
              className="fixed inset-0 bg-black/20 z-40 backdrop-blur-xs"
            />
            
            {/* Settings panel */}
            <motion.div
              className="fixed top-0 left-0 w-full z-50"
              onClick={() => setShowSettings(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
              >
                <Settings showSettings={showSettings} setShowSettings={setShowSettings} />
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

        <ProgressBar />
      </div>
    </div>
  );
}
