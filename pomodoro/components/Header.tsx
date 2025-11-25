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
    const notes = useNotesStore((s) => s.notes);
    const noteWidth = useNotesStore((s) => s.noteWidth);
    const noteHeight = useNotesStore((s) => s.noteHeight);
    const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
    const [bgColor, setBgColor] = useState("#52CAF2");


    useEffect(() => {
        document.documentElement.style.setProperty("--background", bgColor);
    }, []);

    const addSticky = () => {
        const id = uuidv4();
        console.log("add sticky: ", id);
        const lastNoteX = notes.length > 0 ? notes[notes.length - 1].x + 20 : 0;
        const lastNoteY = notes.length > 0 ? notes[notes.length - 1].y + 20: 0;


        addNote({ id: id, x: lastNoteX, y: lastNoteY, text: 'New Sticky Note', color: 'yellow', zIndex: 1, width:noteWidth, height:noteHeight });
    }

    return (
        <div className="rounded-md flex justify-between px-5 pt-5">

            <h1 className="text-5xl font-bold">Pomodoro Puppy</h1>
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
                <Button className="flex items-center justify-center p-2 rounded-lg" onClick={addSticky}>
                    <RiStickyNoteAddLine size={32}/>
                </Button>
                <Button className="flex items-center justify-center p-2 rounded-lg" onClick={() => setSettingsOpen(!settingsOpen)}>
                    <IoSettingsOutline size={32}/>
                </Button>
            </div>
            <AnimatePresence>
                {settingsOpen && <Settings onClose={() => setSettingsOpen(false)} />}
            </AnimatePresence>
        </div>
    );
}