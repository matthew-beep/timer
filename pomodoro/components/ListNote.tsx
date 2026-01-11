"use client";
import { motion } from 'framer-motion'
import { useNotesStore } from '@/store/useNotes';
// TODO: Refactor to use react-rnd instead of draggable

import { generateHTML } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import { JSONContent } from '@tiptap/core';
import { useMemo} from 'react';
import {StickyNote } from '@/store/useNotes';
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
export default function ListNote ({index, text, color, lastEdited} : ListNoteProps) {

    const htmlContent = useMemo(() => {
    try {
      const normalizedText = normalizeNoteText(text);
      return generateHTML(normalizedText, [StarterKit]);
    } catch (error) {
      console.error('Error generating HTML for note:', error);
      return '<p></p>'; // Fallback empty paragraph
    }
  }, [text]);

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
      <header className="font-bold text-lg mb-2">Header</header>
      <div className="flex-1 flex flex-col overflow-hidden justify-between">
        <div 
          className="text-sm overflow-auto prose prose-sm prose-invert tiptap"
          dangerouslySetInnerHTML={{ __html: htmlContent}}
        >
        </div>
        {lastEdited && (
          <div className="text-xs text-gray-400">
            Last edited: {new Date(lastEdited).toLocaleString()}
          </div>
        )}
      </div>

    </motion.div>



  );
}
