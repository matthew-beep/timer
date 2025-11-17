"use client";
import { useTimer } from "@/store/useTimer";
import { Button } from "@/components/Button";
export function TimerControls() {
  const start = useTimer((s) => s.start);
  const pause = useTimer((s) => s.pause);
  const isRunning = useTimer((s) => s.isRunning);

  return (
    <div className="flex gap-4 w-full items-center justify-center">
      {!isRunning ? (
        <Button
          onClick={start}
          className="w-full px-4 py-2"
        >
          Start
        </Button>
      ) : (
        <Button
          onClick={pause}
          className="w-full px-4 py-2"
        >
          Pause
        </Button>
      )}
    </div>
  );
}