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
};

type NotesStore = {
  notes: StickyNote[];
  addNote: (note: StickyNote) => void;
  updateNote: (id: string, updates: Partial<StickyNote>) => void;
  deleteNote: (id: string) => void;
  MAX_Z: number;
  noteWidth: number;
  noteHeight: number;
};

export const useNotesStore = create<NotesStore>()(
  persist(
    (set) => ({
      notes: [],
      noteWidth: 220,
      noteHeight: 300,
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
        MAX_Z: 1000,
    }),
    
    {
      name: "sticky-notes", // localStorage key
    }
  )
);

