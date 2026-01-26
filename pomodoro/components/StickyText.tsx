"use client";

import { useState } from "react";
import { useNotesStore } from "@/store/useNotes";
import Tiptap from "./Tiptap";
import { JSONContent } from '@tiptap/core';

interface StickyTextProps {
  id: string;
  initialText: JSONContent;
  height: number;
  colorIndex: number;
  showToolbar: boolean;
  tagIds: string[];
}

export default function StickyText({
  id = "",
  initialText = { type: 'doc', content: [{ type: 'text', text: '' }] },
  height,
  colorIndex,
  showToolbar,
  tagIds = [],
}: StickyTextProps) {
  return (


    /*
    <textarea
      value={text}
      onChange={(e) => saveText(e.target.value)}
      className="bg-transparent w-full h-full resize-none outline-none p-3 text-white text-sm"
      placeholder="Enter text..."
    />*/
    <div className="flex-1 min-h-0 pt-3">
      <Tiptap content={initialText} id={id} height={height} colorIndex={colorIndex} showToolbar={showToolbar} tagIds={tagIds} />
    </div>

  );
}
