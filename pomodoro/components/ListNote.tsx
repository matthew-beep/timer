"use client";
import { motion } from 'framer-motion'
import { useNotesStore } from '@/store/useNotes';
// TODO: Refactor to use react-rnd instead of draggable

import { generateHTML } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import { JSONContent } from '@tiptap/core';
import { useEffect } from 'react';
import {StickyNote } from '@/store/useNotes';
interface ListNoteProps extends StickyNote {

  index:number;

}

export default function ListNote ({index, text, color} : ListNoteProps) {

  return (

          <motion.div 
            className={`p-2 w-auto flex flex-col rounded-xl`}
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
            <div 
              className="ml-2 text-sm  overflow-auto prose prose-sm prose-invert tiptap"
              dangerouslySetInnerHTML={{ __html: generateHTML(text, [StarterKit]) }}
            >
            </div>
          </motion.div>



  );
}
