'use client'
import { motion, AnimatePresence } from 'motion/react';
import { useTimer } from '@/store/useTimer';
import { useNotesStore, DEFAULT_NOTE_WIDTH, DEFAULT_NOTE_HEIGHT } from '@/store/useNotes';
import { useEffect, useState } from 'react';
import { IoSettingsOutline, IoAddOutline } from 'react-icons/io5';
import { Button } from '@/components/Button';
import { LuLayoutGrid, LuList } from "react-icons/lu";
import { useThemeStore } from '@/store/useTheme';
import { DARK_STICKY_COLORS, LIGHT_STICKY_COLORS } from "@/components/Themes";
import { v4 as uuidv4 } from 'uuid';
import { PetRenderer } from './Pet';

import TimerToolbar from './TimerToolbar';
const emptyText = { type: 'doc', content: [{ type: 'paragraph' }] };


export default function ProgressBar() {


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


    const collapsed = useTimer((s) => s.collapsed);

    useEffect(() => {
      // Initialize view mode based on store value
      console.log("viewMode from store: ", viewMode);
      
    }, [viewMode]);

    const addSticky = () => {
      const stickyColor = theme == "dark" ? DARK_STICKY_COLORS[0] : LIGHT_STICKY_COLORS[0];
      const id = uuidv4();
      console.log("add sticky: ", id);
      const lastNoteX = notes.length > 0 ? notes[notes.length - 1].x + 20 : 0;
      const lastNoteY = notes.length > 0 ? notes[notes.length - 1].y + 20 : 0;
      const now = new Date().toISOString();
      const maxZ = notes.length > 0
          ? Math.max(...notes.map(n => n.zIndex))
          : 0;

      addNote({ id: id, x: lastNoteX, y: lastNoteY, text: emptyText, plainText: "", color: stickyColor, colorIndex: 0, zIndex: maxZ + 1, width: DEFAULT_NOTE_WIDTH, height: DEFAULT_NOTE_HEIGHT, mode: "text", dateCreated: now, lastEdited: now });
  }

    return (
      <div
        className="w-screen bottom-0 flex flex-col left-0 h-auto absolute overflow-hidden gap-1"
      >
        <div className="flex justify-between items-end">
          <div className='bg-[#0a1929]/60 border-white/10 rounded-md shadow-md hover:shadow-2xl transition-all duration-150 relative backdrop-blur-xl text-xs p-1 ml-5'>
            Spotify coming soon 
          </div>
                {/* Center: Collapsed timer + pets */}
        <AnimatePresence mode="wait">
          {collapsed && (
            <motion.div 
              className='flex flex-col items-center gap-2'
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ 
                opacity: 1, 
                y: 0, 
                scale: 1,
                transition: {
                  duration: 0.4,
                  ease: [0.34, 1.56, 0.64, 1], // Bounce easing
                }
              }}
              exit={{ 
                opacity: 0, 
                y: 50, 
                scale: 0.95,
                transition: { duration: 0.25 }
              }}
            >
              {/* Compact pets - delay until timer toolbar is in place */}
              <motion.div 
                className="relative h-20 flex items-center justify-center w-full"
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.3 }}
              >
                <motion.div
                  initial={{opacity: 0 }}
                  animate={{opacity: 1 }}
                  transition={{ delay: 0.45, duration: 0.3 }}
                >
                  <PetRenderer id="turtle" scale={0.6} />
                </motion.div>
                <motion.div
                  initial={{opacity: 0 }}
                  animate={{opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.3 }}
                >
                  <PetRenderer id="rottweiler" scale={1.2} />
                </motion.div>
              </motion.div>
              {/* Compact timer toolbar first */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.3 }}
              >
                <TimerToolbar />
              </motion.div>

            </motion.div>
          )}
        </AnimatePresence>
        <div className='flex items-center pr-5 h-10 gap-2'>
          <div
            className="bg-cardBg/60 text-text flex items-center p-1 rounded-full backdrop-blur-md border-white/10 border h-full"
          >
            <Button
              onClick={() => updateViewMode("grid")}
              variant='plain'
              className={`p-2 rounded-full`}
              isActive = {viewMode === 'grid'}

            >
              <LuLayoutGrid size={18} />
            </Button>
            <Button
              onClick={() => updateViewMode("list")}
              variant='plain'
              className={`p-2 rounded-full `}
              isActive = {viewMode === 'list'}
            >
              <LuList size={18} />
            </Button>
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
        <div 
          className="w-full h-2 hover:h-5 transition-all duration-300
          bg-gray-500 relative"
          onMouseEnter={() => setShowText(true)}
          onMouseLeave={() => setShowText(false)}
          >
          <motion.div
            className={`h-full bg-active/80 origin-left absolute left-0 w-full bottom-0`}
            animate={{ scaleX: progress }}
            transition={{ ease: "linear", duration: 0.1 }}
          />
          {showText &&
          <motion.div 
            className={`absolute top-0 left-0 w-full h-full flex justify-center items-center text-white text-xs font-sans`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ ease: "linear", duration: 1 }}
          >
              {timerActive ?
                <span>{mode === 'focus' ? 'Pomodoro' : 'Break'} {Math.floor(progress * 100)}% complete</span> :
                <span>Timer Stopped</span>
              }
          </motion.div>
          }
        </div>
      </div>
    );
}