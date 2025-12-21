import { motion } from 'motion/react';
import { useTimer } from '@/store/useTimer';



export default function ProgressBar() {



      const timeRemaining = useTimer((s) => s.timeRemaining);
      const duration = useTimer((s) => s.duration);
      const progress = 1 - timeRemaining / duration;
      const timerActive = useTimer((s) => s.isRunning);
      


    return (
      <div
      className="w-screen bottom-0 flex flex-col left-0 h-auto absolute overflow-hidden"
      >
        <div className='flex  items-center p-2 gap-2'>
          <div className='w-4 h-4 bg-black rounded-full'></div>
          <div className='w-4 h-4 bg-black rounded-full'></div>
          <div className='w-4 h-4 bg-black rounded-full'></div>
          <div className='w-4 h-4 bg-black rounded-full'></div>
        </div>
        <div 
          className="w-full h-5 hover:h-8 transition-all duration-300 
          bg-gray-500 py-3 relative">
          <motion.div
            className="h-full bg-black origin-left absolute left-0 w-full bottom-0"
            animate={{ scaleX: progress }}
            transition={{ ease: "linear", duration: 0.1 }}
          />
          <div className='absolute top-0 left-0 w-full h-full flex justify-center items-center text-white font-bold'>
              {timerActive ?
                <span>Pomodoro {Math.floor(progress * 100)}% complete</span> :
                <span>Timer Stopped</span>
              }
          </div>
        </div>
      </div>
    );
}