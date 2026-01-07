'use client'
import { motion } from 'motion/react';
import { useTimer } from '@/store/useTimer';
import { useState } from 'react';


export default function ProgressBar() {



      const timeRemaining = useTimer((s) => s.timeRemaining);
      const duration = useTimer((s) => s.duration);
      const progress = 1 - timeRemaining / duration;
      const timerActive = useTimer((s) => s.isRunning);
      
      const mode = useTimer((s) => s.mode);
      const [showText, setShowText] = useState(false);
      const pomodoroCount = useTimer((s) => s.pomodoroCount);

    return (
      <div
      className="w-screen bottom-0 flex flex-col left-0 h-auto absolute overflow-hidden"
      >
        <div className="flex justify-between items-center">
          <div className='flex items-center p-2 gap-2'>
            <div className={`w-4 h-4 ${pomodoroCount >= 1 ? 'bg-active' : 'bg-gray-500 opacity-25'} rounded-full`}></div>
            <div className={`w-4 h-4 ${pomodoroCount >= 2 ? 'bg-active' : 'bg-gray-500 opacity-25'} rounded-full`}></div>
            <div className={`w-4 h-4 ${pomodoroCount >= 3 ? 'bg-active' : 'bg-gray-500 opacity-25'} rounded-full`}></div>
            <div className={`w-4 h-4 ${pomodoroCount >= 4 ? 'bg-active' : 'bg-gray-500 opacity-25'} rounded-full`}></div>
          </div>
          <div className='bg-[#0a1929]/60 border-white/10 rounded-md shadow-md hover:shadow-2xl transition-all duration-150 relative backdrop-blur-xl text-xs p-1 mx-2'>
            Spotify coming soon 
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