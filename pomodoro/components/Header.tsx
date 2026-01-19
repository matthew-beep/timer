import { useState, useEffect } from 'react';
import { useNotesStore, DEFAULT_NOTE_WIDTH, DEFAULT_NOTE_HEIGHT } from '@/store/useNotes';
import { Button } from './Button';
import { v4 as uuidv4 } from 'uuid';
import { IoSettingsOutline, IoAddOutline, IoPersonOutline } from 'react-icons/io5';
import { useThemeStore } from '@/store/useTheme';

import AuthButton from './AuthButton';

import { DARK_STICKY_COLORS, LIGHT_STICKY_COLORS } from "@/components/Themes";


const emptyText = { type: 'doc', content: [{ type: 'paragraph' }] };


export default function Header({ showSettings, setShowSettings, setShowAuthModal, showAuthModal }: { showSettings: boolean, setShowSettings: (show: boolean) => void, setShowAuthModal: (show: boolean) => void, showAuthModal: boolean }) {

    const addNote = useNotesStore((s) => s.addNote);
    const notes = useNotesStore((s) => s.notes);
    const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
    const syncState = useNotesStore((s) => s.syncState);
    const theme = useThemeStore((s) => s.theme);

    const addSticky = () => {
        const stickyColor = theme == "dark" ? DARK_STICKY_COLORS[0] : LIGHT_STICKY_COLORS[0];
        const id = uuidv4();
        console.log("add sticky: ", id);
        const lastNoteX = notes.length > 0 ? notes[notes.length - 1].x + 20 : 0;
        const lastNoteY = notes.length > 0 ? notes[notes.length - 1].y + 20 : 0;
        const now = new Date().toISOString();
        const maxZ = notes.length > 0
            ? Math.max(...notes.map(n => n.zIndex))
            : 0;

        addNote({ id: id, x: lastNoteX, y: lastNoteY, text: emptyText, plainText: "", color: stickyColor, colorIndex: 0, zIndex: maxZ + 1, width: DEFAULT_NOTE_WIDTH, height: DEFAULT_NOTE_HEIGHT, mode: "text", dateCreated: now, lastEdited: now });
    }
    // probably want to debounce the sync menu
    return (
        <div className="rounded-md flex justify-between py-10 px-5 relative z-10">
            <h1 className="text-3xl font-bold text-text">Study Space</h1>
            
            <div className='flex relative gap-2'>
                <Button
                    className="flex items-center justify-center p-2 rounded-full"
                    onClick={addSticky}
                    variant='glassPlain'
                >
                    <IoAddOutline size={18} strokeWidth={0.5} />
                </Button>
                <Button
                    className="flex items-center justify-center p-2 rounded-full"
                    onClick={() => setShowSettings(!settingsOpen)}
                    variant='glassPlain'
                >
                    <IoSettingsOutline size={18} strokeWidth={0.5} />
                </Button>
                <AuthButton onSignInClick={() => setShowAuthModal(!showAuthModal)} />
            </div>

        </div>
    );
}