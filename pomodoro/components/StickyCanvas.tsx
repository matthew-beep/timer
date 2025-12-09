"use client";

import { useRef, useState, useMemo, useEffect } from "react";
import { Rnd } from "react-rnd";
import { ReactSketchCanvas, ReactSketchCanvasRef } from "react-sketch-canvas";
import { IoIosClose } from "react-icons/io";
import { useNotesStore } from "@/store/useNotes";
import { MdDraw } from "react-icons/md";
import { Button } from "./Button";
import type { CanvasPath } from "react-sketch-canvas";


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

interface StickyCanvasProps {
  id: string;
  initialText?: string;
  color?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  mode?: "draw" | "text";
  paths?: CanvasPath[]; // <-- important
}

export default function StickyCanvas({
  id = "",

  color = "#FFF476",
  paths= [],
}: StickyCanvasProps) {

  const canvasRef = useRef<ReactSketchCanvasRef>(null);
  const updateNote = useNotesStore((s) => s.updateNote);




  const saveCanvas = async () => {
    if (!canvasRef.current) return;
    const paths = await canvasRef.current.exportPaths();
    
    console.log("Saved paths: ", paths);
    //updateNote(id, { paths });
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
    <div className="border-2 w-full h-full relative">
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
      <div className="h-12 absolute bottom-0 w-full pointer-events-none flex p-1"> 
        <Button 
          className="pointer-events-auto rounded-full w-12" 
          onClick={undoStroke}
          >undo
        </Button>
        <Button 
          className="pointer-events-auto rounded-full w-12" 
          onClick={redoStroke}
          >redo
        </Button>
        <Button 
          className="pointer-events-auto rounded-full w-12" 
          onClick={() => {console.log("save")}}
          >save
        </Button>
      </div>
    </div>
  );
}
