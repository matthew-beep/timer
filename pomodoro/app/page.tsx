"use client";

import Timer from "@/components/Timer";
import Header from "@/components/Header";
import { useNotesStore } from "@/store/useNotes";
import StickyNote from "@/components/Sticky";
export default function Home() {
  const notes = useNotesStore((s) => s.notes);
  return (
    <div className="h-screen flex flex-col font-sans">
      <Header />
      <div className="relative overflow-hidden h-full border-blue-200">
        <div className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none">
          {notes.map((note) => (
            <StickyNote key={note.id} id={note.id} />
          ))}
        </div>
        <div className="w-full flex flex-col items-center h-full">
          <h1 className="text-6xl font-bold text-[var(--text)]">Pomodoro Puppy</h1>
          <Timer />
        </div>
      </div>

    </div>
  );
}
