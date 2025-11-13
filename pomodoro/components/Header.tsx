import { useState, useEffect } from 'react';
import { useTimer } from "@/store/useTimer";
import { TimerController } from "@/components/TimerController";
import { TimerControls } from "@/components/TimerControls";
import { Button } from './Button';
import Settings from '@/components/Settings';
import { motion, AnimatePresence } from 'motion/react';

export default function Header() {
    const isRunning = useTimer((s) => s.isRunning);
    const [settingsOpen, setSettingsOpen] = useState<boolean>(false);

    const addCard = () => {
        console.log("add card");
    }

    return (
        <div className="rounded-md flex justify-end">
            {isRunning ?
            <div>timer active</div> :
            <div>timer inactive</div>
            }
            <div className='flex border-2 relative'>
                <Button className="w-auto flex-shrink" onClick={addCard}>Sticky</Button>
                <Button className="w-auto flex-shrink" onClick={() => setSettingsOpen(!settingsOpen)}>Settings</Button>
                
            </div>
                <AnimatePresence>
                    {settingsOpen && <Settings onClose={() => setSettingsOpen(false)} />}
                </AnimatePresence>

            
        </div>
    );
}