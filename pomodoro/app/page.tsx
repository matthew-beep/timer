"use client";

import Timer from "@/components/Timer";
import Header from "@/components/Header";
import { CanvasWrapper } from "@/components/Canvas";
import { useState, useEffect } from "react";
import { ReactSketchCanvas } from "react-sketch-canvas";
import { useNotesStore } from "@/store/useNotes";
import StickyNote from "@/components/Sticky";
export default function Home() {
  const [bgColor, setBgColor] = useState("#1e293b");
  const notes = useNotesStore((s) => s.notes);



  return (

      <div className="h-screen flex flex-col font-sans text-[var(--text-color)] border-2 border-amber-600">
        <Header />
        <div className="relative overflow-hidden border-2 h-full border-blue-200">
          <div className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none">
            {notes.map((note) => (
              <StickyNote key={note.id} id={note.id} />
            ))}
          </div>
          <div className="w-full flex flex-col items-center justify-center h-full">
            <h1 className="text-6xl">Pomodoro Puppy</h1>
            <Timer />
          </div>
        </div>

      </div>
  );
}
