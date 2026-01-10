"use client";
import { motion } from 'framer-motion'
import { useNotesStore } from '@/store/useNotes';
import ListNote from '@/components/ListNote';

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
        {notes.map((note, index) => (
          <ListNote key={note.id} index={index} text={note.text} color={note.color} />
        ))}

    </motion.div>
  );
}
