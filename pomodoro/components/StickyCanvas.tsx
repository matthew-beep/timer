"use client";

import { useRef } from "react";
import { ReactSketchCanvas, ReactSketchCanvasRef } from "react-sketch-canvas";
import { useNotesStore } from "@/store/useNotes";
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
    <div className="w-full h-full relative outline-none">
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
      <div className="h-12 absolute bottom-0 w-full pointer-events-none flex justify-between p-1 bg-black/10"> 
        <div className="flex gap-1 h-full">
          <Button 
            className="pointer-events-auto rounded-full h-10 w-10" 
            onClick={undoStroke}
            >undo
          </Button>
          <Button 
            className="pointer-events-auto rounded-full h-10 w-10" 
            onClick={redoStroke}
            >redo
          </Button>
        </div>
        <Button 
          className="pointer-events-auto rounded-full h-10 w-10" 
          onClick={() => {console.log("save")}}
          >save
        </Button>
      </div>
    </div>
  );
}
