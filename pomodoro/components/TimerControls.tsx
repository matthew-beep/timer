"use client";
import { useTimer } from "@/store/useTimer";
import { Button } from "@/components/Button";
import { FaPlay, FaPause } from "react-icons/fa";
import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { GoScreenFull } from "react-icons/go";

import { CiUndo } from "react-icons/ci";



export function TimerControls({handleStart} : {handleStart: () => void}) {
  const start = useTimer((s) => s.start);
  const pause = useTimer((s) => s.pause);
  const isRunning = useTimer((s) => s.isRunning);
  const reset = useTimer((s) => s.reset);

  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen()
      } else {
        await document.exitFullscreen()
      }
    } catch (err) {
      console.error('Error toggling fullscreen:', err)
    }
  }


  return (
    <div className="flex gap-4 w-full items-center justify-center">
      <Button onClick={reset} variant="plain" className="p-2 rounded-full flex items-center justify-center">
        <CiUndo size={24} />
      </Button>

      <Button
        onClick={() => {
          if (isRunning) {
            pause();
          } else {
            handleStart();
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
              <FaPause className={`fill-current`} />
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
      <Button onClick={toggleFullscreen} tooltip={isFullscreen ? "Exit Fullscreen" : "Fullscreen"} variant="plain" className="p-2 rounded-full flex items-center justify-center">
        <GoScreenFull size={24} />
      </Button>
    </div>
  );
}
