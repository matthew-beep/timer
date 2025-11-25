import { useState, useEffect } from 'react';
import { useNotesStore } from '@/store/useNotes';

import { v4 as uuidv4 } from 'uuid';
import { motion } from 'motion/react';
import { useTimer } from '@/store/useTimer';



export default function ProgressBar() {



      const timeRemaining = useTimer((s) => s.timeRemaining);
      const duration = useTimer((s) => s.duration);
      const progress = 1 - timeRemaining / duration;


    return (
          <div 
            className="w-screen h-4 hover:h-8 transition-all duration-300 
            bg-gray-500 overflow-hidden bottom-0 left-0 absolute">
            <motion.div
              className="h-full bg-black origin-left absolute left-0 w-full bottom-0"
              animate={{ scaleX: progress }}
              transition={{ ease: "linear", duration: 0.1 }}
            />
            <div className='absolute top-0 left-0 w-full h-full flex justify-center items-center text-white font-bold'>
                test
            </div>
          </div>
        
    );
}