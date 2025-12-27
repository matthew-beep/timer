'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import MenuBar from './TextMenuBar'
import { useNotesStore } from "@/store/useNotes";
import { JSONContent } from '@tiptap/core';
const Tiptap = ({content, id}: {content: JSONContent, id:string}) => {
    const updateNote = useNotesStore((s) => s.updateNote);

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
            // console.log('Editor content updated:', json);
            console.log('Editor content updated:', editor.getHTML());
            console.log('Editor content updated (JSON):', JSON.stringify(json));
            updateNote(id, { text: json });
        }

    })

    return (
        <div className='h-full flex flex-col relative'>
            <EditorContent editor={editor} className="h-full overflow-auto"/>
            {editor && (
                <div className='absolute bottom-0 left-0 w-full'>
                    <MenuBar editor={editor} />
                </div>
            )}
        </div>
        
    )
}

export default Tiptap;