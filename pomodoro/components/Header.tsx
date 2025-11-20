import { useState, useEffect } from 'react';
import { useTimer } from "@/store/useTimer";
import { useNotesStore } from '@/store/useNotes';
import { Button } from './Button';
import Settings from '@/components/Settings';
import { AnimatePresence } from 'motion/react';
import { v4 as uuidv4 } from 'uuid';
import { IoSettingsOutline } from 'react-icons/io5';
import { RiStickyNoteAddLine } from "react-icons/ri";


export default function Header() {

    const addNote = useNotesStore((s) => s.addNote);
    const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
    const [bgColor, setBgColor] = useState("#1e293b");


    useEffect(() => {
        document.documentElement.style.setProperty("--background", bgColor);
    }, []);

    const addSticky = () => {
        const id = uuidv4();
        console.log("add sticky: ", id);
        addNote({ id: id, x: 0, y: 0, text: 'New Sticky Note', color: 'yellow', zIndex: 1 });
    }

    return (
        <div className="rounded-md flex justify-end">
            <input
            type="color"
            className="w-10 h-10 cursor-pointer"
            value={bgColor}
            onChange={(e) => {
                const newColor = e.target.value;
                setBgColor(newColor);
                document.documentElement.style.setProperty("--background", newColor);
            }}
            />

            <div className='flex relative gap-2'>    
                <Button className="flex items-center justify-center p-2" onClick={addSticky}>
                    <RiStickyNoteAddLine size={32}/>
                </Button>
                <Button className="flex items-center justify-center p-2" onClick={() => setSettingsOpen(!settingsOpen)}>
                    <IoSettingsOutline size={32}/>
                </Button>
            </div>
            <AnimatePresence>
                {settingsOpen && <Settings onClose={() => setSettingsOpen(false)} />}
            </AnimatePresence>
        </div>
    );
}