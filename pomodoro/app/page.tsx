"use client";

import Timer from "@/components/Timer";
import Header from "@/components/Header";
import { useNotesStore } from "@/store/useNotes";
import StickyNote from "@/components/Sticky";
import Pet from "@/components/Pet";

export default function Home() {
  const notes = useNotesStore((s) => s.notes);
  return (

      <div className="h-screen flex flex-col font-sans p-5 text-[var(--text)]">
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
        </div>

      </div>
  );
}
