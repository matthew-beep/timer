'use client'
import { motion } from 'motion/react';
import { useTimer } from '@/store/useTimer';
import {useNotesStore} from '@/store/useNotes';
import { useEffect, useState } from 'react';
import { IoSettingsOutline, IoAddOutline } from 'react-icons/io5';
import { Button } from '@/components/Button';
import { LuLayoutGrid, LuList } from "react-icons/lu";
import NotesList from '@/components/NotesList';
export default function ProgressBar() {



    const timeRemaining = useTimer((s) => s.timeRemaining);
    const duration = useTimer((s) => s.duration);
    const progress = 1 - timeRemaining / duration;
    const timerActive = useTimer((s) => s.isRunning);
    const updateViewMode = useNotesStore((s) => s.updateViewMode);
    const mode = useTimer((s) => s.mode);
    const viewMode = useNotesStore((s) => s.viewMode);
    const [showText, setShowText] = useState(false);


    useEffect(() => {
      // Initialize view mode based on store value
      console.log("viewMode from store: ", viewMode);
      
    }, [viewMode]);

    return (
      <div
        className="w-screen bottom-0 flex flex-col left-0 h-auto absolute overflow-hidden gap-1"
      >
        <div className="flex justify-between items-center">
          <div className='bg-[#0a1929]/60 border-white/10 rounded-md shadow-md hover:shadow-2xl transition-all duration-150 relative backdrop-blur-xl text-xs p-1 mx-2'>
            Spotify coming soon 
          </div>
        {/* Notes Toggle */}
        <div
          className="glass-plain rounded-md flex items-center gap-1 p-1 mr-5"
        >
          <Button
            onClick={() => updateViewMode("grid")}
            variant='plain'
            className={`p-2 rounded-lg`}
            isActive = {viewMode === 'grid'}

          >
            <LuLayoutGrid size={18} />
          </Button>
          <Button
            onClick={() => updateViewMode("list")}
            variant='plain'
            className={`p-2 rounded-lg `}
            isActive = {viewMode === 'list'}
          >
            <LuList size={18} />
          </Button>
        </div>
        </div>
        <div 
          className="w-full h-5 hover:h-8 transition-all duration-300 
          bg-gray-500 py-3 relative"
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
            className={`absolute top-0 left-0 w-full h-full flex justify-center items-center text-white font-bold`}
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