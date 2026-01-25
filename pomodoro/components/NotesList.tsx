"use client";
import { motion, AnimatePresence } from 'framer-motion'
import { useNotesStore } from '@/store/useNotes';
import { useMemo, useState } from 'react';
import ListNote from '@/components/ListNote';
import Modal, { ModalSection } from "@/components/Modal";
import { IoAddOutline } from 'react-icons/io5';
import { Button } from "@/components/Button";
import { useTagsStore } from '@/store/useTags';
import { TagPill } from '@/components/TagPill';
export default function NotesList({ showList, setShowList }: { showList: boolean, setShowList: (mode: "grid" | "list") => void }) {
  const notes = useNotesStore((s) => s.notes);
  const tags = useTagsStore((s) => s.tags);
  const [tag, setTag] = useState<string>("");

  const sortedNotes = useMemo(() => {
    return [...notes].sort((a, b) => {
      const dateA = a.lastEdited ? new Date(a.lastEdited).getTime() : 0;
      const dateB = b.lastEdited ? new Date(b.lastEdited).getTime() : 0;
      return dateB - dateA; // Most recent first
    });
  }, [notes]);

  

  const handleCreate = async (tagName: string) => {
    const tagsStore = useTagsStore.getState();
    // 1. Create the global definition
    try {
      const newTag = await tagsStore.createTag(tagName);
      console.log("Created new tag:", newTag);
    } catch (error) {    
      console.error("Error creating and attaching tag:", error);
    }
  };

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
            width={320}
            defaultX={20}
            defaultY={20}
            className='h-10/12 p-0'
          >
            <ModalSection className='flex flex-col items-center'>
              <input
                type="text"
                placeholder="Search notes..."
                className={`px-3 w-full bg-text/5 py-2.5 outline-none text-sm text-text placeholder:text-text/50 rounded-md`}
              />
              <div className='flex flex-row w-full items-center justify-start'>
                <Button variant="plain" className="flex p-1 justify-center items-center rounded-full text-text">
                  <IoAddOutline size={24} />
                </Button>
                <div className="flex overflow-x-auto w-full h-full grow">

                  {tags.map((tag) => (
                    <TagPill key={tag.id} tagId={tag.id} name={tag.name} color={tag.color} />
                  ))}
                </div>
              </div>
            </ModalSection>
            <input 
              type='text'
              value={tag} // Link the value to your state
              placeholder='Create new tag...'
              className={`px-3 w-full bg-text/5 py-2.5 ...`}
              onKeyDown={async (e) => {
                if (e.key === 'Enter' && tag.trim() !== '') {
                  const val = tag.trim();
                  setTag(''); // Clearing state here automatically clears the input
                  await handleCreate(val);
                }
              }}
              onChange={(e) => setTag(e.currentTarget.value)}
            />
            <ModalSection className=' w-full overflow-y-auto relative'>

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
                  plainText={note.plainText}
                  color={note.color}
                  dateCreated={note.dateCreated}
                  lastEdited={note.lastEdited}
                  colorIndex={note.colorIndex}
                />
              ))}
            </ModalSection>
            <ModalSection className='flex justify-center'>
              <Button variant="plain" className="flex h-8 justify-center items-center rounded-full text-text w-full">
                Add Note <IoAddOutline size={16} />
              </Button>
            </ModalSection>
          </Modal>
        </motion.div>
      }
    </AnimatePresence>

  );
}
