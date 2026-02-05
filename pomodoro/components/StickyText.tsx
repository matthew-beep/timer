"use client";

import { useState } from "react";
import { useNotesStore } from "@/store/useNotes";
import Tiptap from "./Tiptap";
import { JSONContent } from '@tiptap/core';

interface StickyTextProps {
  id: string;
  initialText: JSONContent;
  height: number;
  color: string;
  showToolbar: boolean;
  tagIds: string[];
  variant?: "default" | "expanded";
}

export default function StickyText({
  id = "",
  initialText = { type: 'doc', content: [{ type: 'text', text: '' }] },
  height,
  color,
  showToolbar,
  tagIds = [],
  variant = "default",
}: StickyTextProps) {
  return (
    <div className="flex-1 min-h-0 pt-3 z-0 h-full">
      <Tiptap content={initialText} id={id} height={height} color={color} showToolbar={showToolbar} tagIds={tagIds} variant={variant} />
    </div>
  );
}
