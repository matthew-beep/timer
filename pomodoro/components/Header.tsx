import { useState, useEffect } from 'react';
import { useTimer } from "@/store/useTimer";
import { TimerController } from "@/components/TimerController";
import { TimerControls } from "@/components/TimerControls";
import { Button } from './Button';

export default function Header() {
    const isRunning = useTimer((s) => s.isRunning);
    return (
        <div className="rounded-md bg-[var(--timer-background)] flex justify-end">
            {isRunning ?
            <div>timer active</div> :
            <div>timer inactive</div>
            }
            <Button>Settings</Button>
        </div>
    );
}