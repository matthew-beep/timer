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

import { HiOutlinePencil } from "react-icons/hi2";
import { RxText } from "react-icons/rx";
import { BiPaint } from "react-icons/bi";

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
  color = "#00b8db",
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
    style={{ 
      display: "flex",
    }}   // important for stretch
  >
      <div
        className="w-full h-full flex flex-col rounded-sm hover:scale-105 shadow-md hover:shadow-2xl transition-all duration-150 relative backdrop-blur-xl"
        style={{
          backgroundColor: 'rgba(10, 25, 41, 0.5)', 
          border: `1px solid ${color}`,
        }}  
      >

        <div
          className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
        {/* Header / Handle */}
        <div
          className="
            sticky-handle cursor-move flex justify-between items-center 
            font-semibold border-b border-white/5 bg-white/5 h-12 p-2
          "
        >
          <div className="flex items-center gap-1 bg-black/20 rounded-lg p-1">
            <button 
              className={`cursor-pointer w-8 h-full flex items-center justify-center transition-all duration-150 rounded-sm p-1.5 ${mode === 'draw' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70'}`}
              onClick={
                () => {
                  updateNote(id, { mode: "draw" }) 
                  setDraw(true);
                }
              }>
                <BiPaint size={14} />
            </button> 
            <button 
              className={`cursor-pointer w-8 h-full flex items-center justify-center transition-all duration-150 rounded-sm p-1.5 ${mode === 'text' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70'}`}
              onClick={
                () => {
                  updateNote(id, { mode: "text" }) 
                  setDraw(false);
                }
              }>
                <RxText 
                  size={14} 

                />
            </button>  
          </div>

            <Button
              className="w-8 h-8 flex items-center justify-center transition-all duration-150 rounded-full" 
              onClick={() => deleteNote(id)}
              variant="plain"
            >
              <IoIosClose 
                size={24} 
                />
            </Button>

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
