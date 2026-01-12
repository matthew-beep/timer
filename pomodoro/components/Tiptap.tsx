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

    useEffect(() => { 
        console.log("height changing: ", height);
        if (height< 250) {
            console.log("Menu disappear, padding change");
        }
    }, [height]);

    return (
        <div 
            className="relative h-full min-h-0 flex flex-col justify-end"
        >
        {/* Editor layer */}
        <div 
            className="absolute inset-0 min-h-0 pl-3"
            style={{
                paddingBottom: `${height < 250 || !activeNote ? "5px" : "50px"}`
            }}
        >
            <EditorContent
            editor={editor}
            className="h-full min-h-0 overflow-auto text-text"
            />
        </div>

        {/* Menu overlay */}
        {editor && activeNote && height > 250 && (
            <div className="bottom-0 left-0 w-full z-20 pointer-events-auto">
                <MenuBar editor={editor} />
            </div>
        )}
        </div>
    )
}

export default Tiptap;
