import { useTimer } from "@/store/useTimer";
import { TimerController } from "@/components/TimerController";
import { TimerControls } from "@/components/TimerControls";
import { Button } from "./Button";
import { useEffect, useRef } from "react"; 
import { useNotesStore } from "@/store/useNotes";
import { Tooltip } from "@mui/material";

export default function Timer() {
  const timeRemaining = useTimer((s) => s.timeRemaining);
  const mode = useTimer((s) => s.mode);
  const setMode = useTimer((s) => s.setMode);
  const isRunning = useTimer((s) => s.isRunning);
  const start = useTimer((s) => s.start);
  const audioRef = useRef<HTMLAudioElement>(null)
  const pomodoroCount = useTimer((s) => s.pomodoroCount);
  const updatePomodoroCount = useTimer((s) => s.updatePomodoroCount);

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
    if (timeRemaining <= 0 && !isRunning) { 

      if (mode === "focus") {
        updatePomodoroCount(); // No more dependency on 'pomodoroCount'
      }

      if (audioRef.current) {
        audioRef.current.currentTime = 0
        audioRef.current.play().catch(err => {
          console.log('Audio play failed:', err)
        })
      }
      
    }

  }, [timeRemaining, isRunning, mode, setMode, start, updatePomodoroCount]);

  return (
    <div 
      className="flex flex-col w-full p-6 space-y-4 rounded-3xl bg-cardBg backdrop-blur-xs saturate-80 border-border border"
    >
      
      {/* Mode Buttons */}
      <div className="grid grid-cols-3 gap-2">
        <Button
          variant={mode === "focus" ? "glass" : "plain"}
          onClick={() => mode === "focus" ? null : setMode("focus")}
          className="px-4 py-2 rounded-full"
        >
          Work
        </Button>
        <Button
          variant={mode === "short" ? "glass" : "plain"}
          onClick={() => mode === "short" ? null : setMode("short")}
          className="px-4 py-2 rounded-full"
        >
          Short Break
        </Button>
        <Button
          variant={mode === "long" ? "glass" : "plain"}
          onClick={() => mode === "long" ? null : setMode("long")}
          className="px-4 py-2 rounded-full"
        >
          Long Break
        </Button>
      </div>

      {/* Timer Display */}
      <div className="flex justify-center px-5">
        <h3 className="text-9xl font-bold tabular-nums tracking-tight text-text">
          {minutes}:{seconds}
        </h3>
      </div>
      <div className='flex items-center p-2 gap-2 justify-center'>
        <Tooltip title="Pomodoros Completed" arrow>
          <div className={`w-2 h-2 ${pomodoroCount >= 1 ? 'bg-active' : 'bg-gray-500 opacity-25'} rounded-full`}></div>
        </Tooltip>
        <div className={`w-2 h-2 ${pomodoroCount >= 2 ? 'bg-active' : 'bg-gray-500 opacity-25'} rounded-full`}></div>
        <div className={`w-2 h-2 ${pomodoroCount >= 3 ? 'bg-active' : 'bg-gray-500 opacity-25'} rounded-full`}></div>
        <div className={`w-2 h-2 ${pomodoroCount >= 4 ? 'bg-active' : 'bg-gray-500 opacity-25'} rounded-full`}></div>
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
          setMode(mode === "focus" ? "short" : "focus");
          start();
        }}
      />

      <TimerControls />
      
    </div>
  );
}
