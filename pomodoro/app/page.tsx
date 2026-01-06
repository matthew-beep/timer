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

export default function Home() {
  const notes = useNotesStore((s) => s.notes);
  const [showSettings, setShowSettings] = useState(false);
  const mode = useTimer((s) => s.mode);
  const colors = useThemeStore((s) => s.colors);

  
  
  useEffect(() => { 
    const activeColor = mode === "focus" ? colors.work : colors.break;
    document.documentElement.style.setProperty("--primary", activeColor);
  }, [mode, colors.work, colors.break]);

  return (
    <div className="h-screen flex flex-col font-sans text-[var(--text)] mesh">
      <Header showSettings={showSettings} setShowSettings={setShowSettings}/>
      <div className="relative h-full">
        <div className="absolute top-0 left-0 w-full h-full z-10 pointer-events-none overflow-hidden">
          {notes.map((note) => (
            <StickyNote key={note.id} mode={note.mode} text={note.text} id={note.id} x={note.x} y={note.y} width={note.width} height={note.height} paths={note.paths} zIndex={note.zIndex} inlineSvg={note.inlineSvg}/>
          ))}
        </div>
        
        <div className="w-full flex flex-col items-center h-full justify-center z-0  ">
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