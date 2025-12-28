import { useTimer } from "@/store/useTimer";
import { TimerController } from "@/components/TimerController";
import { TimerControls } from "@/components/TimerControls";
import { Button } from "./Button";
import { useEffect } from "react"; 
import { useModeStore } from "@/store/useTheme";

export default function Timer() {
  const timeRemaining = useTimer((s) => s.timeRemaining);
  const mode = useTimer((s) => s.mode);
  const setMode = useTimer((s) => s.setMode);
  const isRunning = useTimer((s) => s.isRunning);



  const toggleMode = () => {

    document.documentElement.style.setProperty("--work", "#ffffff");
    console.log("new val", document.documentElement.style.getPropertyValue("--work"));
  }
  const minutes = Math.floor(timeRemaining / 60)
    .toString()
    .padStart(2, "0");

  const seconds = (timeRemaining % 60).toString().padStart(2, "0");

  useEffect(() => { 
    if (timeRemaining <= 0 && !isRunning) { 
      const audio = new Audio('/sounds/small-dog.wav');
      audio.play();
    }

  }, [timeRemaining, isRunning]);

  return (
    <div className="w-full max-w-sm p-6 space-y-6 bg-[#0a1929]/60 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] border border-active rounded-3xl">
      
      {/* Mode Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant={mode === "focus" ? "glass" : "plain"}
          onClick={() => setMode("focus")}
          className="px-4 py-2 rounded-full"
        >
          Work
        </Button>
        <Button
          variant={mode === "short" ? "glass" : "plain"}
          onClick={() => {
            toggleMode();
            setMode("short")
          }}
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
