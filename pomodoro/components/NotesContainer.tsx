"use client";

import { useNotesStore } from "@/store/useNotes";
import StickyNote from "@/components/Sticky";
import NotesList from "@/components/NotesList";

export default function NotesContainer() {
    const notes = useNotesStore((s) => s.notes);
    const viewMode = useNotesStore((s) => s.viewMode);
    const updateViewMode = useNotesStore((s) => s.updateViewMode);

    return (
        <div className="absolute top-0 left-0 w-full h-full z-10 pointer-events-none overflow-hidden">
            {viewMode === 'grid' ? (
                notes.map((note) => (
                    <StickyNote
                        key={note.id}
                        mode={note.mode}
                        text={note.text}
                        id={note.id}
                        color={note.color}
                        x={note.x}
                        y={note.y}
                        width={note.width}
                        height={note.height}
                        paths={note.paths}
                        zIndex={note.zIndex}
                        inlineSvg={note.inlineSvg}
                        dateCreated={note.dateCreated}
                        lastEdited={note.lastEdited}
                    />
                ))
            ) : (
                <NotesList showList={viewMode === "list"} setShowList={updateViewMode} />
            )}
        </div>
    );
}
