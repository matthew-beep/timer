import { useTimer } from "@/store/useTimer";
import { TimerController } from "@/components/TimerController";
import { TimerControls } from "@/components/TimerControls";
import { Button } from "./Button";

export default function Timer() {
  const timeRemaining = useTimer((s) => s.timeRemaining);
  const mode = useTimer((s) => s.mode);
  const setMode = useTimer((s) => s.setMode);

  const minutes = Math.floor(timeRemaining / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (timeRemaining % 60).toString().padStart(2, "0");

  return (
    <div className="w-full max-w-sm rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-[var(--timer-bg)] text-[var(--timer-fg)] shadow-sm p-6 space-y-6">
      
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
        <h3 className="text-7xl font-bold tabular-nums tracking-tight">
          {minutes}:{seconds}
        </h3>
      </div>

      <div className="w-full h-2 bg-gray-500 rounded-full"></div>


      {/* Controls + Timer Logic */}
      <TimerController />
      <TimerControls />
    </div>
  );
}
