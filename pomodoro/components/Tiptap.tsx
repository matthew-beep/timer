'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import MenuBar from './TextMenuBar'
import { useNotesStore } from "@/store/useNotes";
import { JSONContent } from '@tiptap/core';
import { useEffect } from 'react';
import StickyBottomBar from '@/components/StickyBottomBar';

const Tiptap = ({ color, content, id, height, showToolbar, tagIds, variant = "default" }: { tagIds: string[], color: string, content: JSONContent, id: string, height: number, showToolbar: boolean, variant?: "default" | "expanded" }) => {
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
            const json: JSONContent = editor.getJSON();
            updateNote(id, {
                text: json,
                plainText: editor.getText()
            });
        }

    })

    return (
        <div
            className="relative h-full min-h-0 flex flex-col justify-end"
        >
            {/* Editor layer */}
            <div
                className="absolute inset-0 min-h-0 pl-3 z-0"
                style={{
                    paddingBottom: `${height < 250 || !activeNote ? "5px" : "65px"}`
                }}
            >
                <EditorContent
                    editor={editor}
                    className="h-full min-h-0 overflow-auto text-text"
                />
            </div>

            {/* Menu overlay */}
            {editor && (
                <StickyBottomBar
                    show={showToolbar}
                    id={id}
                    tagIds={tagIds}
                    color={color}
                    variant={variant}
                >
                    <MenuBar editor={editor} />
                </StickyBottomBar>
            )}
        </div>
    )
}

export default Tiptap;
