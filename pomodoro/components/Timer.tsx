import { useTimer } from "@/store/useTimer";
import { TimerController } from "@/components/TimerController";
import { TimerControls } from "@/components/TimerControls";
import { Button } from "./Button";
import { useEffect, useRef, useState } from "react"; 
import { RiCollapseDiagonalFill } from "react-icons/ri";
import { motion } from "motion/react";
export default function Timer() {
  const timeRemaining = useTimer((s) => s.timeRemaining);
  const mode = useTimer((s) => s.mode);
  const setMode = useTimer((s) => s.setMode);
  const isRunning = useTimer((s) => s.isRunning);
  const audioRef = useRef<HTMLAudioElement>(null)
  const toggleCollapsed = useTimer(s => s.toggleCollapsed);

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
    if (!justCompleted) return;

    audioRef.current?.play().catch(console.error);

  }, [justCompleted]);

  const [isHovered, setIsHovered] = useState(false);


  return (
    <div 
      className="flex flex-col w-[420px] p-6 space-y-4 rounded-3xl bg-cardBg backdrop-blur-xs saturate-80 border-border border font-display"
    > 
      <motion.div 
        className="flex flex-col border-b border-border pb-4 gap-2"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        initial={{ opacity: 0, y: -10 }}
        animate={{
          y: isHovered ? -16 : 0,
          opacity: isHovered ? 1 : 0.7,
        }}
        transition={{ duration: 0.2 }}
        >
        <div className="flex justify-between items-center font-sans">
          <h4>SESSION GOAL</h4>
          <Button variant="plain" className="rounded-full p-2" onClick={toggleCollapsed}>
            <RiCollapseDiagonalFill />
          </Button>
        </div>
        <div className="flex justify-between items-center">
          <input
            type="text"
            placeholder="Set a goal"
            className={`px-3 w-full bg-text/5 py-2.5 outline-none text-sm text-text placeholder:text-text/50 rounded-md`}
          />
        </div>
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

      <TimerControls />
      
    </div>
  );
}
