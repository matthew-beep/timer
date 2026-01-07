import { useTimer } from "@/store/useTimer";
import { TimerController } from "@/components/TimerController";
import { TimerControls } from "@/components/TimerControls";
import { Button } from "./Button";
import { useEffect } from "react"; 
import { useNotesStore } from "@/store/useNotes";

export default function Timer() {
  const timeRemaining = useTimer((s) => s.timeRemaining);
  const mode = useTimer((s) => s.mode);
  const setMode = useTimer((s) => s.setMode);
  const isRunning = useTimer((s) => s.isRunning);
  const start = useTimer((s) => s.start);

  const pomodoroCount = useTimer((s) => s.pomodoroCount);
  const updatePomodoroCount = useTimer((s) => s.updatePomodoroCount);

  const minutes = Math.floor(timeRemaining / 60)
    .toString()
    .padStart(2, "0");

  const seconds = (timeRemaining % 60).toString().padStart(2, "0");
  


  useEffect(() => { 
    if (timeRemaining <= 0 && !isRunning) { 
      const audio = new Audio('/sounds/small-dog.wav');

      if (mode === "focus") {
        updatePomodoroCount(); // No more dependency on 'pomodoroCount'
      }

      audio.addEventListener('ended', () => {
        console.log('Audio finished playing!');
        // Call your function here
        // handleAudioComplete();
        setMode(mode === "focus" ? "short" : "focus");
        start();
      });

      audio.play();
      
    }

  }, [timeRemaining, isRunning, mode, setMode, start, updatePomodoroCount]);

  return (
    <div className="w-full max-w-sm p-6 space-y-6 bg-[#0a1929]/60 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] border border-active rounded-3xl">
      
      {/* Mode Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant={mode === "focus" ? "glass" : "plain"}
          onClick={() => mode === "focus" ? null : setMode("focus")}
          className="px-4 py-2 rounded-full"
        >
          Work
        </Button>
        <Button
          variant={mode === "short" ? "glass" : "plain"}
          onClick={() => mode === "short" || mode === "long" ? null : setMode("short")}
          className="px-4 py-2 rounded-full"
        >
          Break
        </Button>
      </div>

      {/* Timer Display */}
      <div className="flex justify-center">
        <h3 className="text-9xl font-bold tabular-nums tracking-tight">
          {minutes}:{seconds}
        </h3>
      </div>

      {/* Controls + Timer Logic */}
      <TimerController />
      <TimerControls />
    </div>
  );
}
