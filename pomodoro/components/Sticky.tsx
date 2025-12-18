"use client";

import { useRef, useState, useEffect } from "react";
import { Rnd } from "react-rnd";
import { ReactSketchCanvas, ReactSketchCanvasRef } from "react-sketch-canvas";
import { IoIosClose } from "react-icons/io";
import { useNotesStore } from "@/store/useNotes";
import { MdDraw } from "react-icons/md";
import { Button } from "./Button";
import type { CanvasPath } from "react-sketch-canvas";
import StickyText  from "./StickyText";
import StickyCanvas  from "./StickyCanvas";



interface StickyNoteProps {
  id: string;
  text?: string;
  color?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  mode?: "draw" | "text";
  paths?: CanvasPath[]; // <-- important
}

export default function StickyNote({
  id = "",
  text = "",
  color = "#FFF476",
  x = 100,
  y = 100,
  width = 220,
  height = 220,
  mode = "text",
  paths= [],
}: StickyNoteProps) {
  
  const [draw, setDraw] = useState(mode === "draw" ? true : false);
  const canvasRef = useRef<ReactSketchCanvasRef>(null);
  const deleteNote = useNotesStore((s) => s.deleteNote);
  const updateNote = useNotesStore((s) => s.updateNote);

  const saveCanvas = async () => {
    if (!canvasRef.current) return;
    const paths = await canvasRef.current.exportPaths();
    
    console.log("Saved paths: ", paths);
    updateNote(id, { paths });
  };

  const undoStroke = () => {
    if (!canvasRef.current) return;
    canvasRef.current.undo();
  }

  const redoStroke = () => {
    if (!canvasRef.current) return;
    canvasRef.current.redo();
  }




  
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
    className="pointer-events-auto"
    style={{ display: "flex" }}   // important for stretch
  >
      <div
        className="w-full h-full flex flex-col border rounded-sm scale-95 hover:scale-100 shadow-md hover:shadow-2xl transition-all duration-150"
        style={{ backgroundColor: color }}
      >
        {/* Header / Handle */}
        <div
          className="
            sticky-handle cursor-move flex justify-end items-center 
            font-semibold text-black/70 bg-black/5 h-12
          "
        >

          <div className="flex items-center justify-end w-full h-full ">
            <button 
            className="w-12 h-full flex items-center justify-center text-black hover:bg-black/10 transition-all duration-150"
            onClick={
              () => {
                updateNote(id, { mode: draw ? "text" : "draw" }) 
                setDraw(!draw);
              }
              }>
                <MdDraw size={24} />
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
        {draw ? 
        (<StickyCanvas id={id} color={color} paths={paths} />) 
        : 
        (<StickyText id={id} initialText={text} />)
        }


      </div>
    </Rnd>
  );
}
