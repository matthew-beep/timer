import { useTimer } from "@/store/useTimer";
import { TimerController } from "@/components/TimerController";
import { TimerControls } from "@/components/TimerControls";
import { Button } from "./Button";
import { motion } from "motion/react";

export default function Timer() {
  const timeRemaining = useTimer((s) => s.timeRemaining);
  const mode = useTimer((s) => s.mode);
  const setMode = useTimer((s) => s.setMode);

  const duration = useTimer((s) => s.duration);

  const progress = 1 - timeRemaining / duration;

  const minutes = Math.floor(timeRemaining / 60)
    .toString()
    .padStart(2, "0");

  const seconds = (timeRemaining % 60).toString().padStart(2, "0");

  return (
    <div className="w-full max-w-sm text-[var(--timer-fg)] p-6 space-y-6">
      
      {/* Mode Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant={mode === "focus" ? "primary" : "secondary"}
          onClick={() => setMode("focus")}
          className="px-4 py-2"
        >
          Work
        </Button>
        <Button
          variant={mode === "short" ? "primary" : "secondary"}
          onClick={() => setMode("short")}
          className="px-4 py-2"
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

      <div className="w-full h-2 bg-gray-500 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-black rounded-full origin-left"
          animate={{ scaleX: progress }}
          transition={{ ease: "linear", duration: 0.1 }}
        />
      </div>


      {/* Controls + Timer Logic */}
      <TimerController />
      <TimerControls />
    </div>
  );
}
