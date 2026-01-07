'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import MenuBar from './TextMenuBar'
import { useNotesStore } from "@/store/useNotes";
import { JSONContent } from '@tiptap/core';
import { useEffect } from 'react';

const Tiptap = ({content, id, height}: {content: JSONContent, id:string, height: number}) => {
    const updateNote = useNotesStore((s) => s.updateNote);
    const activeNoteId = useNotesStore(s => s.activeNoteId);
    const activeNote = activeNoteId === id;
    const setActiveNote = useNotesStore(s => s.setActiveNote);
    const editor = useEditor({
        extensions: [StarterKit.configure({
            heading: {
                levels: [1, 2, 3],
            },
        })],
        content: content,
        // Don't render immediately on the server to avoid SSR issues
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class: "w-full h-full text-white outline-none hover",
            }
        },
        onUpdate: ({ editor }) => {
            // You can handle content updates here if needed
            const json: JSONContent = editor.getJSON();
            console.log("updating note content: ", json);
            updateNote(id, { text: json });
        }

    })

    useEffect(() => { console.log(height)}, [height]);

    return (
        <div className="h-full flex flex-col relative min-h-0">
            <div className="flex-1 min-h-0 overflow-hidden">
                <EditorContent
                editor={editor}
                className="h-full overflow-auto px-3"
                />
            </div>

        {editor && activeNote && height > 250 && (
            <div className="absolute bottom-0 left-0 w-full z-10">
            <MenuBar editor={editor} />
            </div>
        )}
        </div>
        
    )
}

export default Tiptap;