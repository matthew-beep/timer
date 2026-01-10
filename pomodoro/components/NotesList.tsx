"use client";
import { motion } from 'framer-motion'
import { useNotesStore } from '@/store/useNotes';
import ListNote from '@/components/ListNote';

export default function NotesList() {
  const notes = useNotesStore((s) => s.notes);

  return (
    // Pass nodeRef to Draggable and attach the ref to the actual DOM node child
  
    <motion.div 
      className="top-0 left-0 absolute border-2 z-10 flex-1 flex flex-col h-full p-4 pointer-events-none bg-[#0a1929]/50 backdrop-blur-2xl border-l border-white/10 gap-3"
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
          <ListNote key={note.id} id={note.id} x={note.x} y={note.y} index={index} zIndex={note.zIndex} height={note.height} width={note.width} text={note.text} color={note.color} dateCreated={note.dateCreated} lastEdited={note.lastEdited}/>
        ))}

    </motion.div>
  );
}
