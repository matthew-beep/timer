"use client";

import { useRef, useState } from "react";
import { Rnd } from "react-rnd";
import { ReactSketchCanvas, ReactSketchCanvasRef } from "react-sketch-canvas";
import { IoIosClose } from "react-icons/io";
import { useNotesStore } from "@/store/useNotes";

export default function StickyNote({
  id = "",
  initialText = "",
  color = "#FFF476",
  x = 100,
  y = 100,
  width = 220,
  height = 300,
}) {
  const [text, setText] = useState(initialText);
  const [draw, setDraw] = useState(false);
  const canvasRef = useRef<ReactSketchCanvasRef>(null);
  const deleteNote = useNotesStore((s) => s.deleteNote);
  const updateNote = useNotesStore((s) => s.updateNote);

  return (
  <Rnd
    position={{ x, y }}
    size={{ width: width, height: height }}
    onDragStop={(e, d) => updateNote(id, { x: d.x, y: d.y })}
    onResizeStop={(e, direction, ref, delta, position) => {
      console.log("resized to: ", ref.offsetWidth, ref.offsetHeight);
      updateNote(id, {
        width: ref.offsetWidth,
        height: ref.offsetHeight,
        x: position.x,
        y: position.y,
      });
    }}
    minWidth={200}
    minHeight={160}
    maxWidth={600}
    maxHeight={600}
    dragHandleClassName="sticky-handle"
    bounds="parent"
    className="rounded-md shadow-lg overflow-hidden pointer-events-auto"
    style={{ display: "flex" }}   // important for stretch
  >
      <div
        style={{ backgroundColor: color }}
        className="w-full h-full flex flex-col"
      >
        {/* Header / Handle */}
        <div
          className="
            sticky-handle cursor-move flex justify-end items-center 
            p-3 font-semibold text-black/70 bg-black/5
          "
        >

          <div className="flex gap-2">
            <button onClick={() => setDraw(!draw)}>draw</button>
            <button 
            className="rounded-full text-black/60 hover:bg-gray-600 hover:text-red-500"
            onClick={() => deleteNote(id)}
            >
              <IoIosClose 
                size={18} 
                />
            </button>
          </div>
        </div>

        {/* Content */}
        {!draw && (
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="bg-transparent w-full h-full resize-none outline-none p-3 text-black/80 text-sm"
          />
        )}

        {draw && (
          <ReactSketchCanvas
            ref={canvasRef}
            strokeWidth={2}
            strokeColor="black"
            className="w-full h-full"
          />
        )}
      </div>
    </Rnd>
  );
}
