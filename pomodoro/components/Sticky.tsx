"use client";

import { useRef, useState } from "react";
import { Rnd } from "react-rnd";
import { ReactSketchCanvas, ReactSketchCanvasRef } from "react-sketch-canvas";
import { IoIosClose } from "react-icons/io";
import { useNotesStore } from "@/store/useNotes";


function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  
  return function(...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

export default function StickyNote({
  id = "",
  initialText = "",
  color = "#FFF476",
  x = 100,
  y = 100,
  width = 220,
  height = 220,
  mode = "text",
}) {
  const [text, setText] = useState(initialText);
  const [draw, setDraw] = useState(mode === "draw" ? true : false);
  const canvasRef = useRef<ReactSketchCanvasRef>(null);
  const deleteNote = useNotesStore((s) => s.deleteNote);
  const updateNote = useNotesStore((s) => s.updateNote);

  const saveText = (newText: string) => {
    setText(newText);
    updateNote(id, { text: newText });
  }

  

  const saveCanvas = async () => {
    if (!canvasRef.current) return;
    const paths = await canvasRef.current.exportPaths();
    //updateNote(id, { paths });
    console.log("Saved paths: ", paths);
  };

  return (
  <Rnd
    position={{ x, y }}
    size={{ width: width, height: height }}
    onDragStop={(e, d) => updateNote(id, { x: d.x, y: d.y })}
    onResizeStop={(e, direction, ref, delta, position) => {
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
    className="rounded-md shadow-lg overflow-hidden pointer-events-auto border border-[#cccccc]"
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
            font-semibold text-black/70 bg-black/5 h-12
          "
        >

          <div className="flex gap-2 items-center justify-end w-full h-full ">
            <button onClick={
              () => {
                updateNote(id, { mode: draw ? "text" : "draw" }) 
                setDraw(!draw);
              }
              }>
                draw
            </button>
            <button 
              className="w-12 h-full flex items-center justify-center text-black hover:bg-black/10 transition-all duration-150"
              onClick={() => deleteNote(id)}
            >
              <IoIosClose 
                size={24} 
                />
            </button>
          </div>
        </div>

        {/* Content */}
        {!draw && (
          <textarea
            value={text}
            onChange={(e) => saveText(e.target.value)}
            className="bg-transparent w-full h-full resize-none outline-none p-3 text-black/80 text-sm"
          />
        )}

        {draw && (
          <ReactSketchCanvas
            ref={canvasRef}
            strokeWidth={2}
            strokeColor="black"
            style={{ border: "none" }}
            className="w-full h-full border-none"
            onStroke={saveCanvas}
            onChange={saveCanvas}
            canvasColor={color}
          />
        )}
      </div>
    </Rnd>
  );
}
