"use client";

import { useState } from "react";
import { useNotesStore } from "@/store/useNotes";
import Tiptap from "./Tiptap";
import { JSONContent } from '@tiptap/core';

interface StickyTextProps {
  id: string;
  initialText: JSONContent;
}

export default function StickyText({
  id = "",
  initialText = {},

}: StickyTextProps) {
  const [text, setText] = useState(initialText);
  const updateNote = useNotesStore((s) => s.updateNote);


  return (


    /*
    <textarea
      value={text}
      onChange={(e) => saveText(e.target.value)}
      className="bg-transparent w-full h-full resize-none outline-none p-3 text-white text-sm"
      placeholder="Enter text..."
    />*/
    <div className="flex-1 min-h-0 p-3">
      <Tiptap content={text} id={id} />
    </div>

  );
}
