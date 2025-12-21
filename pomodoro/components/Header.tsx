import { useState, useEffect } from 'react';
import { useNotesStore } from '@/store/useNotes';
import { Button } from './Button';
import { v4 as uuidv4 } from 'uuid';
import { IoSettingsOutline } from 'react-icons/io5';
import { RiStickyNoteAddLine } from "react-icons/ri";


export default function Header({showSettings, setShowSettings}: {showSettings: boolean, setShowSettings: (show: boolean) => void}) {

    const addNote = useNotesStore((s) => s.addNote);
    const notes = useNotesStore((s) => s.notes);
    const noteWidth = useNotesStore((s) => s.noteWidth);
    const noteHeight = useNotesStore((s) => s.noteHeight);
    const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
    const [bgColor, setBgColor] = useState("#a2d2ff");


    useEffect(() => {
        document.documentElement.style.setProperty("--background", bgColor);
    }, []);

    const addSticky = () => {
        const id = uuidv4();
        console.log("add sticky: ", id);
        const lastNoteX = notes.length > 0 ? notes[notes.length - 1].x + 20 : 0;
        const lastNoteY = notes.length > 0 ? notes[notes.length - 1].y + 20: 0;


        addNote({ id: id, x: lastNoteX, y: lastNoteY, text: "", color: 'yellow', zIndex: 1, width:noteWidth, height:noteHeight, mode: "text" });
    }

    return (
        <div className="rounded-md flex justify-between px-5 pt-5 relative z-10">

            <h1 className="text-5xl font-bold">Study Space</h1>
            <div className='flex relative gap-2'>    
                <Button className="flex items-center justify-center p-2 rounded-full" onClick={addSticky}>
                    <RiStickyNoteAddLine size={32}/>
                </Button>
                <Button 
                className="flex items-center justify-center p-2 rounded-full" onClick={() => setShowSettings(!settingsOpen)}>
                    <IoSettingsOutline size={32}/>
                </Button>
            </div>

        </div>
    );
}


/*            <AnimatePresence>
                {settingsOpen && <Settings onClose={() => setSettingsOpen(false)} />}
            </AnimatePresence>*/