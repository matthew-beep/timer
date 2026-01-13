"use client";
import { motion } from 'framer-motion'
import { useNotesStore } from '@/store/useNotes';
// TODO: Refactor to use react-rnd instead of draggable
import { Button } from '@/components/Button';
import { generateHTML } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import { JSONContent } from '@tiptap/core';
import { useMemo} from 'react';
import {StickyNote } from '@/store/useNotes';
import { IoTrashOutline } from "react-icons/io5";
interface ListNoteProps extends StickyNote {

  index:number;

}


const normalizeNoteText = (text: unknown): JSONContent => {
  // If it's already a valid TipTap document, return it
  if (text && typeof text === 'object' && 'type' in text && text.type === 'doc' && 'content' in text) {
    return text as JSONContent;
  }
  
  // If it's an empty object or invalid, return empty TipTap doc
  if (!text || (typeof text === 'object' && Object.keys(text).length === 0)) {
    return { type: 'doc', content: [{ type: 'paragraph' }] };
  }
  
  // If it's a string (legacy format), wrap it in TipTap structure
  if (typeof text === 'string') {
    return {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: text ? [{ type: 'text', text }] : []
        }
      ]
    };
  }
  
  // Fallback to empty doc
  return { type: 'doc', content: [{ type: 'paragraph' }] };
};
export default function ListNote ({index, text, color, lastEdited, id} : ListNoteProps) {

  const deleteNote = useNotesStore((s) => s.deleteNote);

    const htmlContent = useMemo(() => {
    try {
      const normalizedText = normalizeNoteText(text);
      return generateHTML(normalizedText, [StarterKit]);
    } catch (error) {
      console.error('Error generating HTML for note:', error);
      return '<p></p>'; // Fallback empty paragraph
    }
  }, [text]);

  const formatNoteDate = (dateInput: string | number | Date) => {
  const date = new Date(dateInput);
  const now = new Date();

  const isToday = 
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    if (isToday) {
      // Returns "10:45 PM" format
      return date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      // Returns "01/11" format
      return date.toLocaleDateString([], { 
        month: '2-digit', 
        day: '2-digit' 
      });
    }
  };

  return (

    <motion.div 
      className={`p-2 w-auto flex flex-col rounded-xl h-32`}
      style={{
        backgroundColor: `${color}30`,
        border: `1px solid ${color}`,

      }}
      initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          delay: index * 0.05,
        }}
    >
      <div className='flex h-full'>
        
        <div className="flex-1 flex flex-col overflow-hidden justify-between h-full">
          <div 
            className="text-sm overflow-auto prose prose-sm prose-invert tiptap h-full grow flex-1 text-text"
            dangerouslySetInnerHTML={{ __html: htmlContent}}
          >
          </div>
          {lastEdited && (
            <div className="text-xs text-text/60">
              Last edited: {formatNoteDate(lastEdited)}
            </div>
          )}
        </div>
        <Button className='w-4 h-4 hover:text-red-600 rounded-full flex items-center justify-center' variant='plain' onClick={() => deleteNote(id)}><IoTrashOutline /></Button>
      </div>


    </motion.div>



  );
}
