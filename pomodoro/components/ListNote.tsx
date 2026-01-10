"use client";
import { motion } from 'framer-motion'
import { useNotesStore } from '@/store/useNotes';
// TODO: Refactor to use react-rnd instead of draggable

import { generateHTML } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import { JSONContent } from '@tiptap/core';
interface ListNoteProps {
  id?:string;
  index:number;
  text: JSONContent;
  color: string;
}

export default function ListNote ({index, text, color} : ListNoteProps) {

  return (

          <motion.div 
            className={`p-2 w-auto flex flex-col border border-[${color}]`}
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
            <div 
              className="ml-2 text-sm  overflow-auto max-h-32 prose prose-sm prose-invert tiptap"
              dangerouslySetInnerHTML={{ __html: generateHTML(text, [StarterKit]) }}
            >
            </div>
            {color}
          </motion.div>



  );
}
