import { useTimer } from "@/store/useTimer";
import { TimerController } from "@/components/TimerController";
import { TimerControls } from "@/components/TimerControls";
import { Button } from "./Button";
import { useEffect, useRef, useState } from "react"; 
import { RiCollapseDiagonalFill } from "react-icons/ri";
import { motion, AnimatePresence } from "motion/react";
export default function Timer() {
  const timeRemaining = useTimer((s) => s.timeRemaining);
  const mode = useTimer((s) => s.mode);
  const setMode = useTimer((s) => s.setMode);
  const isRunning = useTimer((s) => s.isRunning);
  const audioRef = useRef<HTMLAudioElement>(null)
  const toggleCollapsed = useTimer(s => s.toggleCollapsed);
  const pomodoroCount = useTimer(s => s.pomodoroCount);
  const justCompleted = useTimer(s => s.justCompleted);
  const complete = useTimer(s => s.complete);
  const clearCompletion = useTimer(s => s.clearCompletion);
  const start = useTimer(s => s.start);

  const [quote, setQuote] = useState<string | null>("The secret of getting ahead is getting started");
  const placeholder = "The secret of getting ahead is getting started";
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
  if (!justCompleted || !audioRef.current) return;

  const playAudio = async () => {
    try {
      audioRef.current!.currentTime = 0;
      await audioRef.current!.play();
    } catch (error) {
      // This is where the "Request not allowed" error is caught
      console.warn("Autoplay blocked. User needs to interact with the page first.");
    }
  };

  playAudio();
}, [justCompleted]);

  const [isHovered, setIsHovered] = useState(false);

  // Inside your Timer.tsx or where you manage the audio ref
  const handleStart = async () => {
    // Prime the audio so it can play later in the useEffect
    if (audioRef.current) {
      try {
        // Play and immediately pause/reset
        await audioRef.current.play();
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      } catch (e) {
        console.log("Audio priming failed, will try again on next click");
      }
    }
    start(); // Your Zustand start function
  };


  return (
    <div 
      className="flex flex-col w-[420px] p-6 space-y-4 rounded-3xl bg-cardBg backdrop-blur-xs saturate-80 border-border border font-display"
    > 
      <motion.div 
        className="flex flex-col gap-2"
        >
        <div className="flex justify-between items-center font-sans">
          <h4 className="text-text/50">TIMER</h4>
          <Button variant="plain" className="rounded-full p-2" onClick={toggleCollapsed}>
            <RiCollapseDiagonalFill />
          </Button>
        </div>
        {/*
        <div className="font-display flex justify-between items-center">
          <input
            type="text"
            placeholder={placeholder}
            className={`w-full py-2.5 outline-none text-md text-text placeholder:text-text`}
          />
        </div>
        */}
      </motion.div>

      {/* Mode Buttons */}
      <div className={`grid ${method && method.name === "Pomodoro" ? "grid-cols-3" : "grid-cols-2"} gap-2 font-sans text-md`}>
        <Button
          variant={mode === "focus" ? "glass" : "plain"}
          onClick={() => mode === "focus" ? null : setMode("focus")}
          className="px-4 py-2 rounded-full"
        >
          Work
        </Button>

        {method && method.name === "Pomodoro" ? ( 
         <>
          <Button
            variant={mode === "short" ? "glass" : "plain"}
            onClick={() => mode === "short" ? null : setMode("short")}
            className="px-4 py-2 rounded-full"
          >
            Short
          </Button>


          <Button
            variant={mode === "long" ? "glass" : "plain"}
            onClick={() => mode === "long" ? null : setMode("long")}
            className="px-4 py-2 rounded-full"
          >
            Long
          </Button>
          </>
        ) : (

          <Button
            variant={mode === "break" ? "glass" : "plain"}
            onClick={() => mode === "break" ? null : setMode("break")}
            className="px-4 py-2 rounded-full"
          >
            Break
          </Button>
        )
        
        }

      </div>

      {/* Timer Display */}
      <div className="flex justify-center px-5 flex-col items-center">
        <h3 
          className="text-9xl font-bold tabular-nums tracking-tight text-text w-full text-center"
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

      {/* Session Progress Dots */}
      <div className="flex justify-center items-center gap-2 py-2">
        {method.name === "Pomodoro" ? (
          Array.from({ length: 4 }).map((_, i) => {
            const currentCyclePosition = pomodoroCount % 4;
            
            // If we are on session 4, we want to show dots 1, 2, 3 as finished.
            // If pomodoroCount is 4, 8, etc., it means a full cycle was just finished.
            const isCycleComplete = pomodoroCount > 0 && currentCyclePosition === 0;
            
            const isCompleted = isCycleComplete || currentCyclePosition > i;
            const isActive = !isCycleComplete && currentCyclePosition === i;

            // This is the hex for your 'active' theme color. 
            // If you have it in a CSS variable, use 'var(--active)'
            const activeThemeColor = "var(--active)"; 

            return (
              <motion.div
                key={i}
                initial={false}
                animate={{
                  scale: isActive ? 1.2 : 1,
                  // When done: use theme color. When active: use theme color + glow. Otherwise: faint.
                  boxShadow: isActive ? `0 0 12px var(--active)` : "none",
                  opacity: isCompleted || isActive ? 1 : 0.3,
                }}
                className={`w-2 h-2 rounded-full border border-white/5 transition-colors ${isActive || isCompleted ? 'bg-active' : 'bg-gray-400'}`}
                title={`Session ${i + 1}`}
              />
            );
          })
        ) : (
          /* Cambridge Tally */
          <div className="flex gap-1.5 items-center">
            <span className="text-[10px] text-text/40 font-bold tracking-widest uppercase">Sessions</span>
            {Array.from({ length: Math.min(pomodoroCount, 10) }).map((_, i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-active" />
            ))}
            <span className="text-xs font-medium text-text ml-1">{pomodoroCount}</span>
          </div>
        )}
      </div>

      <TimerControls  handleStart={handleStart} />

    </div>
  );
}
