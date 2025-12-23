'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import MenuBar from './TextMenuBar'
import { Editor } from '@tiptap/react'
const Tiptap = ({content}: {content: string}) => {

    const editor = useEditor({
        extensions: [StarterKit],
        content: content,
        // Don't render immediately on the server to avoid SSR issues
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class: "w-full h-full text-white border-2 outline-none",
            }
        }

    })

    return (
        <div>
            <EditorContent editor={editor} className="h-full"/>
            {editor && <MenuBar editor={editor} />}
        </div>
        
    )
}

export default Tiptap;