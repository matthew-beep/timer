import { useState, useEffect } from 'react';
import { useNotesStore } from '@/store/useNotes';
import { Button } from './Button';
import { v4 as uuidv4 } from 'uuid';
import { IoSettingsOutline, IoAddOutline } from 'react-icons/io5';

const emptyText = { type: 'doc', content: [{ type: 'paragraph' }] };


export default function Header({showSettings, setShowSettings}: {showSettings: boolean, setShowSettings: (show: boolean) => void}) {

    const addNote = useNotesStore((s) => s.addNote);
    const notes = useNotesStore((s) => s.notes);
    const noteWidth = useNotesStore((s) => s.noteWidth);
    const noteHeight = useNotesStore((s) => s.noteHeight);
    const [settingsOpen, setSettingsOpen] = useState<boolean>(false);




    const addSticky = () => {
        const id = uuidv4();
        console.log("add sticky: ", id);
        const lastNoteX = notes.length > 0 ? notes[notes.length - 1].x + 20 : 0;
        const lastNoteY = notes.length > 0 ? notes[notes.length - 1].y + 20: 0;

        const maxZ = notes.length > 0
        ? Math.max(...notes.map(n => n.zIndex))
        : 0;

        addNote({ id: id, x: lastNoteX, y: lastNoteY, text: emptyText, color: 'yellow', zIndex: maxZ + 1, width:noteWidth, height:noteHeight, mode: "text" });
    }

    return (
        <div className="rounded-md flex justify-between p-10 relative z-10">
            <h1 className="text-3xl font-bold">Study Space</h1>
            <div className='flex relative gap-2'>    
                <Button 
                    className="flex items-center justify-center p-2 rounded-full" 
                    onClick={addSticky}
                    variant='glassPlain'
                >
                    <IoAddOutline size={18} strokeWidth={0.5}/>
                </Button>
                <Button 
                    className="flex items-center justify-center p-2 rounded-full" 
                    onClick={() => setShowSettings(!settingsOpen)}
                    variant='glassPlain'
                >
                    <IoSettingsOutline size={18} strokeWidth={0.5}/>
                </Button>
            </div>

        </div>
    );
}