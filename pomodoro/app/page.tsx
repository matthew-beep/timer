"use client";

import Timer from "@/components/Timer";
import Header from "@/components/Header";
import { useNotesStore } from "@/store/useNotes";
import StickyNote from "@/components/Sticky";
import Pet from "@/components/Pet";
import { motion } from "framer-motion";
import { useTimer } from "@/store/useTimer";

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
            <h1 className="text-6xl font-bold">Pomodoro Puppy</h1>
            <Pet />
            <Timer />
          </div>

<div className="w-screen bottom-0 left-0 absolute">
  <div className="relative w-full h-6 bg-gray-500 overflow-hidden">

    {/* Actual progress bar */}
    <motion.div
      className="absolute top-0 left-0 h-full bg-black origin-left"
      animate={{ scaleX: progress }}
      transition={{ ease: "linear", duration: 0.1 }}
    />

    {/* Text ON TOP of the bar */}
    <div className="absolute inset-0 left-0 bottom-0 flex items-center justify-center pointer-events-none">
      <span className="text-white font-medium text-sm">
        {Math.round(progress * 100)}%
      </span>
    </div>

  </div>
</div>


        </div>



      </div>
  );
}
