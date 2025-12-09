"use client";

import { useRef, useState, useMemo, useEffect } from "react";
import { Rnd } from "react-rnd";
import { ReactSketchCanvas, ReactSketchCanvasRef } from "react-sketch-canvas";
import { IoIosClose } from "react-icons/io";
import { useNotesStore } from "@/store/useNotes";
import { MdDraw } from "react-icons/md";
import { Button } from "./Button";
import type { CanvasPath } from "react-sketch-canvas";



interface StickyTextProps {
  id: string;
  initialText: string;
}

export default function StickyText({
  id = "",
  initialText = "",

}: StickyTextProps) {
  const [text, setText] = useState(initialText);
  const updateNote = useNotesStore((s) => s.updateNote);

  const saveText = (newText: string) => {
    setText(newText);
    updateNote(id, { text: newText });
  }

  return (
    <textarea
      value={text}
      onChange={(e) => saveText(e.target.value)}
      className="bg-transparent w-full h-full resize-none outline-none p-3 text-black/80 text-sm"
      placeholder="Enter text..."
    />
  );
}
