"use client";

import Timer from "@/components/Timer";
import Header from "@/components/Header";
import { useNotesStore } from "@/store/useNotes";
import StickyNote from "@/components/Sticky";
import Pet from "@/components/Pet";
import { motion } from "framer-motion";
import { useTimer } from "@/store/useTimer";
import ProgressBar from "@/components/Progress";

export default function Home() {
  const notes = useNotesStore((s) => s.notes);
  const timeRemaining = useTimer((s) => s.timeRemaining);
  const duration = useTimer((s) => s.duration);
  const progress = 1 - timeRemaining / duration;
  return (

      <div className="h-screen flex flex-col font-sans text-[var(--text)]">
        <Header />
        <div className="relative overflow-hidden h-full">
          <div className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none">
            {notes.map((note) => (
              <StickyNote key={note.id} id={note.id} x={note.x} y={note.y} width={note.width} height={note.height} />
            ))}
          </div>
          
          <div className="w-full flex flex-col items-center h-full justify-center">
            <Pet />
            <Timer />
          </div>

          <ProgressBar />
        </div>

      </div>
  );
}
