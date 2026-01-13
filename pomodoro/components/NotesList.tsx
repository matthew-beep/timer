"use client";
import { motion, AnimatePresence } from 'framer-motion'
import { useNotesStore } from '@/store/useNotes';
import { useMemo } from 'react';
import ListNote from '@/components/ListNote';
import Modal, {ModalSection} from "@/components/Modal";
import { IoAddOutline } from 'react-icons/io5';
import { Button } from "@/components/Button"
export default function NotesList({showList, setShowList}: {showList: boolean, setShowList: (mode: "grid" | "list") => void}) {
  const notes = useNotesStore((s) => s.notes);

  const sortedNotes = useMemo(() => {
    return [...notes].sort((a, b) => {
      const dateA = a.lastEdited ? new Date(a.lastEdited).getTime() : 0;
      const dateB = b.lastEdited ? new Date(b.lastEdited).getTime() : 0;
      return dateB - dateA; // Most recent first
    });
  }, [notes]);

  return (
    // Pass nodeRef to Draggable and attach the ref to the actual DOM node child

<AnimatePresence>
  {showList &&  
  <motion.div
    initial={{ opacity: 0, x: -300 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -300 }}
    transition={{ type: 'tween', duration: 0.3 }}
        className="absolute top-0 left-0 z-50 pointer-events-auto h-full"
      >
        <Modal
          title="Notes"
          isOpen={showList}
          onClose={() => setShowList("grid")}
          width="w-80"
          className='h-10/12 ml-5 p-0'
        >
          <ModalSection>
            <Button variant="plain" className="w-8 h-8 shrink justify-center items-center rounded-md p-1 text-text"><IoAddOutline size={24} /></Button>
          </ModalSection>
          <ModalSection className=' w-full overflow-y-auto'>
            {sortedNotes.map((note, index) => (
              <ListNote 
                key={note.id} 
                id={note.id} 
                x={note.x} 
                y={note.y} 
                index={index} 
                zIndex={note.zIndex} 
                height={note.height} 
                width={note.width} 
                text={note.text} 
                color={note.color} 
                dateCreated={note.dateCreated} 
                lastEdited={note.lastEdited}
              />
            ))}
          </ModalSection>
        </Modal>
      </motion.div>
}
    </AnimatePresence>
    
  );
}
