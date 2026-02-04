'use client'
import { motion, AnimatePresence } from 'motion/react';
import { useTimer } from '@/store/useTimer';
import { useNotesStore, DEFAULT_NOTE_WIDTH, DEFAULT_NOTE_HEIGHT } from '@/store/useNotes';
import { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { IoSettingsOutline, IoAddOutline } from 'react-icons/io5';
import { Button } from '@/components/Button';
import { LuLayoutGrid, LuList } from "react-icons/lu";
import { useThemeStore } from '@/store/useTheme';
import { DARK_STICKY_COLORS, LIGHT_STICKY_COLORS } from "@/components/Themes";
import { v4 as uuidv4 } from 'uuid';
import { PetRenderer } from './Pet';
import { usePetStore } from "@/store/usePetStore";

import TimerToolbar from './TimerToolbar';
const emptyText = { type: 'doc', content: [{ type: 'paragraph' }] };

export default function ProgressBar() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const notes = useNotesStore((s) => s.notes);
  const timeRemaining = useTimer((s) => s.timeRemaining);
  const duration = useTimer((s) => s.duration);
  const progress = 1 - timeRemaining / duration;
  const timerActive = useTimer((s) => s.isRunning);
  const updateViewMode = useNotesStore((s) => s.updateViewMode);
  const mode = useTimer((s) => s.mode);
  const viewMode = useNotesStore((s) => s.viewMode);
  const [showText, setShowText] = useState(false);

  const theme = useThemeStore((s) => s.theme);
  const addNote = useNotesStore((s) => s.addNote);
  const activePets = usePetStore((s) => s.activePets);
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const updateWidth = () => setContainerWidth(el.clientWidth);
    updateWidth();
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width;
      if (width != null) setContainerWidth(width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const addSticky = () => {
    const stickyColor = theme == "dark" ? DARK_STICKY_COLORS[0] : LIGHT_STICKY_COLORS[0];
    const id = uuidv4();
    const lastNoteX = notes.length > 0 ? notes[notes.length - 1].x + 20 : 0;
    const lastNoteY = notes.length > 0 ? notes[notes.length - 1].y + 20 : 0;
    const now = new Date().toISOString();
    const maxZ = notes.length > 0 ? Math.max(...notes.map(n => n.zIndex)) : 0;

    addNote({ id, x: lastNoteX, y: lastNoteY, text: emptyText, plainText: "", color: stickyColor, colorIndex: 0, zIndex: maxZ + 1, width: DEFAULT_NOTE_WIDTH, height: DEFAULT_NOTE_HEIGHT, mode: "text", dateCreated: now, lastEdited: now });
  }

  return (
    <div className="w-screen fixed bottom-0 left-0 h-auto flex flex-col pointer-events-none z-50">

      {/* 2. UI LAYER: Reactivates pointer events for buttons/bar */}
      <div className="flex flex-col pointer-events-auto">

        {/* Toolbar Row */}
        <div className="flex justify-between items-end px-5">
          <div className='bg-[#0a1929]/60 border-white/10 mb-1 rounded-md shadow-md backdrop-blur-xl text-xs w-40 text-center p-1'>
            Spotify coming soon
          </div>
          {/* 1. PET LAYER: Transparent, no overflow hidden, allows pets to be tall */}
          <div
            ref={containerRef}
            className="w-full h-16 relative"
          >
            <AnimatePresence>
              {containerWidth > 0 &&
                activePets.map((petId) => (
                  <PetRenderer
                    key={petId}
                    id={petId}
                    containerWidth={containerWidth}
                  />
                ))}
            </AnimatePresence>
          </div>
          <div className='flex items-center h-10 gap-2 mb-1'>
            <div className="relative bg-cardBg/60 p-1 rounded-full backdrop-blur-md border border-white/10 flex items-center h-10 w-24">
              <div className="absolute inset-0 p-1 flex">
                <motion.div
                  className="h-full w-1/2 bg-active/20 border border-active/30 rounded-full"
                  animate={{ x: viewMode === 'grid' ? 0 : '100%' }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              </div>
              <button
                onClick={() => updateViewMode("grid")}
                className={`relative flex-1 flex justify-center items-center h-full z-10 ${viewMode === 'grid' ? 'text-active' : 'text-text/50'}`}
              >
                <LuLayoutGrid size={18} />
              </button>
              <button
                onClick={() => updateViewMode("list")}
                className={`relative flex-1 flex justify-center items-center h-full z-10 ${viewMode === 'list' ? 'text-active' : 'text-text/50'}`}
              >
                <LuList size={18} />
              </button>
            </div>

            <Button
              className="flex items-center justify-center p-2 rounded-full aspect-square h-full"
              onClick={addSticky}
              variant='glassPlain'
            >
              <IoAddOutline size={18} strokeWidth={0.5} />
            </Button>
          </div>
        </div>

        {/* 3. PROGRESS BAR: This is where overflow is hidden to clip the bar growth */}
        <div
          className="w-full h-2 hover:h-5 transition-all duration-300 bg-gray-500 relative overflow-hidden cursor-pointer"
          onMouseEnter={() => setShowText(true)}
          onMouseLeave={() => setShowText(false)}
        >
          <motion.div
            className="h-full bg-active/80 origin-left absolute left-0 w-full bottom-0"
            animate={{ scaleX: progress }}
            initial={{ scaleX: 0 }}
            transition={{ ease: "linear", duration: 0.1 }}
          />

          <AnimatePresence>
            {showText && (
              <motion.div
                className="absolute inset-0 flex justify-center items-center text-white text-xs font-sans pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {timerActive ?
                  <span>{mode === 'focus' ? 'Pomodoro' : 'Break'} {Math.floor(progress * 100)}% complete</span> :
                  <span>Timer Stopped</span>
                }
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}