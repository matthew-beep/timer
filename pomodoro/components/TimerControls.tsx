"use client";
import { useTimer } from "@/store/useTimer";
import { Button } from "@/components/Button";
import { FaPlay, FaPause } from "react-icons/fa";

export function TimerControls() {
  const start = useTimer((s) => s.start);
  const pause = useTimer((s) => s.pause);
  const isRunning = useTimer((s) => s.isRunning);

  return (
    <div className="flex gap-4 w-full items-center justify-center">
      {!isRunning ? (
        <Button
          onClick={start}
          className="w-auto px-4 py-2 rounded-full flex items-center justify-center"
        >
          <FaPlay />
        </Button>
      ) : (
        <Button
          onClick={pause}
          className="w-auto px-4 py-2 rounded-full flex items-center justify-center"
        >
          <FaPause />
        </Button>
      )}
    </div>
  );
}
