import { useState, useEffect } from 'react';
import { useTimer } from "@/store/useTimer";
import { TimerController } from "@/components/TimerController";
import { TimerControls } from "@/components/TimerControls";

export default function Timer() {


    const timeRemaining = useTimer((s) => s.timeRemaining);
  
  const minutes = Math.floor(timeRemaining / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (timeRemaining % 60).toString().padStart(2, "0");



    return (
        <div className="rounded-md bg-[var(--timer-background)]">
            <div> 
                Work | Break
            </div>
            <div>
                        <h1 className="text-6xl">{minutes}:{seconds}</h1>;
            </div>
            <TimerController />
            <TimerControls />
        </div>
    );
}