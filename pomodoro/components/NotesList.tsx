"use client";
import { motion } from 'framer-motion'
import { useNotesStore } from '@/store/useNotes';
// TODO: Refactor to use react-rnd instead of draggable

import { useMemo } from 'react'
import { generateHTML } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
export default function NotesList() {
  const notes = useNotesStore((s) => s.notes);

  return (
    // Pass nodeRef to Draggable and attach the ref to the actual DOM node child
    <motion.div 
      className="top-0 right-0 absolute inset-0 z-10 w-1/2 flex flex-col h-full pointer-events-none bg-[#0a1929]/50 backdrop-blur-2xl border-l border-white/10"
      initial={{
        opacity: 0,
        x: -300,
      }}
      animate={{
        opacity: 1,
        x: 0,
      }}
      exit={{
        opacity: 0,
        x: 300,
      }}
      transition={{ type: 'tween', damping: 25, stiffness: 300 }}
      >
        {notes.map((note) => (
          <div 
            key={note.id}
            className="p-2 border-2 w-auto flex border-white/10 flex-col"
          >
            <p className="text-sm border-2">{note.id}</p>
            <div 
              className="ml-2 text-sm border-2 overflow-auto max-h-32 prose prose-sm prose-invert tiptap"
              dangerouslySetInnerHTML={{ __html: generateHTML(note.text, [StarterKit]) }}
            >
            </div>
          </div>
        ))}

    </motion.div>
  );
}
