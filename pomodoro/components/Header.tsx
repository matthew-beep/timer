import { useState, useEffect } from 'react';
import { useTimer } from "@/store/useTimer";
import { TimerController } from "@/components/TimerController";
import { TimerControls } from "@/components/TimerControls";
import { Button } from './Button';
import Settings from '@/components/Settings';

export default function Header() {
    const isRunning = useTimer((s) => s.isRunning);
    const [settingsOpen, setSettingsOpen] = useState<boolean>(false);

    return (
        <div className="rounded-md bg-[var(--timer-background)] flex justify-end">
            {isRunning ?
            <div>timer active</div> :
            <div>timer inactive</div>
            }
            <Button onClick={() => setSettingsOpen(!settingsOpen)}>Settings</Button>
            {settingsOpen && <Settings />}

            
        </div>
    );
}