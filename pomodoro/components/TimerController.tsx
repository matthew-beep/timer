"use client";
import { useEffect } from "react";
import { useTimer } from "@/store/useTimer";

export function TimerController() {
  const tick = useTimer((s) => s.tick);
  const isRunning = useTimer((s) => s.isRunning);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => tick(), 1000);
    return () => clearInterval(interval);
  }, [isRunning, tick]);

  return null;
}
