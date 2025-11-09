"use client";
import { useTimer } from "@/store/useTimer";

export function TimerControls() {
  const start = useTimer((s) => s.start);
  const pause = useTimer((s) => s.pause);
  const isRunning = useTimer((s) => s.isRunning);

  return (
    <div className="flex gap-4">
      {!isRunning ? (
        <button
          onClick={start}
          className="px-4 py-2 rounded bg-purple-600 text-white"
        >
          Start
        </button>
      ) : (
        <button
          onClick={pause}
          className="px-4 py-2 rounded bg-gray-600 text-white"
        >
          Pause
        </button>
      )}
    </div>
  );
}