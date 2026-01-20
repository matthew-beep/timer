import { useTimer } from "@/store/useTimer";
import { TimerController } from "@/components/TimerController";
import { TimerControls } from "@/components/TimerControls";
import { Button } from "./Button";
import { useEffect, useRef } from "react"; 
import { useNotesStore } from "@/store/useNotes";
import { Tooltip } from "@mui/material";
import { motion } from "motion/react";

export default function TimerToolbar() {
  const timeRemaining = useTimer((s) => s.timeRemaining);
  const mode = useTimer((s) => s.mode);
  const setMode = useTimer((s) => s.setMode);
  const isRunning = useTimer((s) => s.isRunning);

  const audioRef = useRef<HTMLAudioElement>(null)
  const duration = useTimer((s) => s.duration);

  const progress = 1 - timeRemaining / duration;

  const justCompleted = useTimer(s => s.justCompleted);
  const complete = useTimer(s => s.complete);
  const clearCompletion = useTimer(s => s.clearCompletion);
  const start = useTimer(s => s.start);

  const method = useTimer(s => s.method);

  const minutes = Math.floor(timeRemaining / 60)
    .toString()
    .padStart(2, "0");

  const seconds = (timeRemaining % 60).toString().padStart(2, "0");


  useEffect(() => {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    
    document.title = `${formattedTime} | Study Space`;
    
    // Reset title when component unmounts
    return () => {
      document.title = 'Study Space';
    };
  }, [timeRemaining, isRunning, mode]);

  useEffect(() => { 
    console.log("Timer method changed to:", method?.name);
    console.log("mode: ", mode);
  }, [method, mode]);
  
  useEffect(() => {
    if (!justCompleted) return;

    audioRef.current?.play().catch(console.error);

  }, [justCompleted]);


  return (
    <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="flex flex-row items-center w-auto justify-centers rounded-2xl bg-cardBg backdrop-blur-xs saturate-80 border-border border font-display gap-2"
    >
      {/* Timer Display */}
      <div className="flex justify-center items-center">
        <h3 
          className="text-xl font-bold tabular-nums tracking-tight text-text text-center"
            style={{
            fontVariantNumeric: "tabular-nums",
            fontFeatureSettings: "'tnum'",
          }}
          >
          {minutes}:{seconds}
        </h3>
      </div>

      {/* Controls + Timer Logic */}
      <TimerController />
      <audio 
        ref={audioRef} src="/sounds/small-dog.wav" 
        onEnded={() => {
          console.log('Audio finished playing!');
          // Call your function here
          // handleAudioComplete();
          // TODO: need to find when 4 pomodoros complete to switch to long break
          complete();
          clearCompletion();
          start();
        }}
      />

      <TimerControls />
      
    </motion.div>
  );
}
