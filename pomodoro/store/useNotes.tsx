import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CanvasPath } from "react-sketch-canvas";
import { JSONContent } from '@tiptap/core';

export type StickyNote = {
  id: string;
  x: number;
  y: number;
  text: JSONContent;
  color: string;
  zIndex: number;
  width: number;
  height: number;
  mode?: "draw" | "text"
  paths?: CanvasPath[]; // for drawing paths
  inlineSvg?: string; // for storing SVG representation
};

type NotesStore = {
  notes: StickyNote[];
  addNote: (note: StickyNote) => void;
  updateNote: (id: string, updates: Partial<StickyNote>) => void;
  deleteNote: (id: string) => void;
  setActiveNote: (id: string) => void;
  noteWidth: number;
  noteHeight: number;
  bringNoteToFront: (id: string, z:number) => void;
  activeNoteId?: string;
  viewMode: "list" | "grid";
  updateViewMode: (mode: "list" | "grid") => void;
};

export const useNotesStore = create<NotesStore>()(
  persist(
    (set) => ({
      notes: [],
      noteWidth: 300,
      noteHeight: 300,
      viewMode: "grid",
      updateViewMode: (mode) => set({ viewMode: mode }),
      setActiveNote: (id) => set({ activeNoteId: id }),
      addNote: (note) =>
        set((state) => ({ notes: [...state.notes, note] })),

      updateNote: (id, updates) =>
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id ? { ...note, ...updates } : note
          ),
        })),

      deleteNote: (id) =>
        set((state) => ({
          notes: state.notes.filter((note) => note.id !== id),
        })),

      bringNoteToFront: (id: string, z: number) => {
        const MAX_Z = 1000;
        set((state) => {

          let notes = [...state.notes];
          const maxZIndex = Math.max(...notes.map(n => n.zIndex));
          console.log("current z: " + z);

          if (z >= maxZIndex) {
            console.log("Note is already at the front.");
            return { notes };
          }
   
          
          console.log("Bringing note to front. Current max zIndex: ", maxZIndex + ", id: ", id);
          notes = notes.map(note => {
            if (maxZIndex >= MAX_Z) {
              return { ...note, zIndex: note.zIndex - maxZIndex };
            }
            return note;
          });

          return {
            notes: notes.map(note =>
              note.id === id
                ? { ...note, zIndex: Math.max(...notes.map(n => n.zIndex)) + 1 }
                : note
            )
          };
        });
      }
    }),
    
    {
      name: "sticky-notes", // localStorage key
    }
  )
);

