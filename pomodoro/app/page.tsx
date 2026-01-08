"use client";

import Timer from "@/components/Timer";
import Header from "@/components/Header";
import { useNotesStore } from "@/store/useNotes";
import StickyNote from "@/components/Sticky";
import Pet from "@/components/Pet";
import ProgressBar from "@/components/Progress";
import Settings from "@/components/Settings";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useTimer } from "@/store/useTimer";
import { useThemeStore } from "@/store/useTheme";
import { Theme, themes } from "@/components/Themes";

export default function Home() {
  const notes = useNotesStore((s) => s.notes);
  const [showSettings, setShowSettings] = useState(false);
  const mode = useTimer((s) => s.mode);
  const colors = useThemeStore((s) => s.colors);
  const selectedGradient = useThemeStore((s) => s.selectedGradient);

  const applyTheme = (themeIndex: number) => {
    const theme = themes[themeIndex];
    const body = document.body;
    body.style.setProperty('--c-0', theme.colors.c0)
    body.style.setProperty('--c-1', theme.colors.c1)
    body.style.setProperty('--c-2', theme.colors.c2)
    body.style.setProperty('--c-3', theme.colors.c3)
    body.style.setProperty('--c-4', theme.colors.c4)
    body.style.setProperty('--c-5', theme.colors.c5)

  }
  
  /*
  useEffect(() => { 
    const activeColor = mode === "focus" ? colors.work : colors.break;
    document.documentElement.style.setProperty("--primary", activeColor);
  }, [mode, colors.work, colors.break]);
*/
  useEffect(() => {
    console.log("selectedGradient changed: ", selectedGradient);
    applyTheme(selectedGradient);
  }, [selectedGradient]);

  return (
    <div className="h-screen flex flex-col font-sans text-[var(--text)] mesh test">
      <Header showSettings={showSettings} setShowSettings={setShowSettings}/>
      <div className="relative h-full">
        <div className="absolute top-0 left-0 w-full h-full z-10 pointer-events-none overflow-hidden">
          {notes.map((note) => (
            <StickyNote key={note.id} mode={note.mode} text={note.text} id={note.id} x={note.x} y={note.y} width={note.width} height={note.height} paths={note.paths} zIndex={note.zIndex} inlineSvg={note.inlineSvg}/>
          ))}
        </div>
        
        <div className="w-full flex flex-col items-center justify-center h-full z-0">
            <Pet /> 
            <Timer />
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
              className="fixed top-0 left-0 w-full h-full z-50"
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
