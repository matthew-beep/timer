"use client";
import { useTimer } from "@/store/useTimer";
import { Button } from "@/components/Button";
import { FaPlay, FaPause } from "react-icons/fa";
import { motion, AnimatePresence } from "motion/react";
export function TimerControls() {
  const start = useTimer((s) => s.start);
  const pause = useTimer((s) => s.pause);
  const isRunning = useTimer((s) => s.isRunning);

  return (
    <div className="flex gap-4 w-full items-center justify-center ">
  
        <Button
          onClick={() => {
            if (isRunning) {
              pause();
            } else {
              start();
            }
          }}
          className="w-12 h-12 px-4 py-2 rounded-full flex items-center justify-center"
          variant="glass"
        >
          <AnimatePresence mode="wait">
            {isRunning ? (
              <motion.div
                key="pause"
                initial={{
                  opacity: 0,
                  scale: 0.5,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.5,
                }}
              >
                <FaPause className={`fill-current`}/>
              </motion.div>
            ) : (
              <motion.div
                key="play"
                initial={{
                  opacity: 0,
                  scale: 0.5,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.5,
                }}
                className="pl-1" // Optical centering for play icon
              >
                <FaPlay className={`fill-current`} />
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      
    </div>
  );
}
