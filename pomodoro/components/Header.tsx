import { useState } from 'react';
import { useTimer } from "@/store/useTimer";
import { useNotesStore } from '@/store/useNotes';
import { Button } from './Button';
import Settings from '@/components/Settings';
import { AnimatePresence } from 'motion/react';
import { v4 as uuidv4 } from 'uuid';


export default function Header() {
    const isRunning = useTimer((s) => s.isRunning);

    const addNote = useNotesStore((s) => s.addNote);
    const [settingsOpen, setSettingsOpen] = useState<boolean>(false);

    const addSticky = () => {
        const id = uuidv4();
        console.log("add sticky: ", id);
        addNote({ id: id, x: 0, y: 0, text: 'New Sticky Note', color: 'yellow', zIndex: 1 });
    }

    return (
        <div className="rounded-md flex justify-end">
            {isRunning ?
            <div>timer active</div> :
            <div>timer inactive</div>
            }
            <div className='flex border-2 relative'>
                <Button className="w-auto shrink">Draw</Button>
                <Button className="w-auto shrink" onClick={addSticky}>Sticky</Button>
                <Button className="w-auto shrink" onClick={() => setSettingsOpen(!settingsOpen)}>Settings</Button>
                
            </div>
                <AnimatePresence>
                    {settingsOpen && <Settings onClose={() => setSettingsOpen(false)} />}
                </AnimatePresence>

            
        </div>
    );
}