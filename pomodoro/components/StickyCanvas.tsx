"use client";

import { useRef } from "react";
import { ReactSketchCanvas, ReactSketchCanvasRef } from "react-sketch-canvas";
import { useNotesStore } from "@/store/useNotes";
import { Button } from "./Button";
import type { CanvasPath } from "react-sketch-canvas";
import { CiUndo, CiRedo } from "react-icons/ci";
import { motion } from "framer-motion";
import { useState } from "react";

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

  const [editCanvas, setEditCanvas] = useState<boolean>(false);


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
    <div className="w-full h-full relative outline-none overflow-hidden">

      {/* Top Bar */}

      <div 
        className="h-12 absolute top-0 right-0 width-full flex rounded-full p-1 bg-[#0a1929]/80 mb-1 gap-1"
      > 
        <Button 
          className="pointer-events-auto rounded-full h-10 w-10" 
          onClick={() => {console.log("save")}}
          >save
        </Button>
      </div>
      <ReactSketchCanvas
        ref={canvasRef}
        strokeWidth={2}
        strokeColor="white"
        style={{ border: "none" }}
        className="w-full h-full border-none"
        onStroke={saveCanvas}
        onChange={saveCanvas}
        canvasColor="rgba(255, 255, 255, 0)"
      />

      {/* Bottom Toolbar */}
      <motion.div 
        className="h-12 absolute bottom-0 left-1/2 -translate-x-1/2 flex rounded-full p-1 bg-[#0a1929]/80 mb-1 gap-1"
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      
      > 

          <input
            type="color"
            className="h-10 w-10 border-amber-600 cursor-pointer"
            value={"#fff"}
            onChange={(e) => console.log("change color")}
          />
        
          <Button 
            className="pointer-events-auto rounded-full h-10 w-10 flex items-center justify-center" 
            onClick={undoStroke}
            >
              <CiUndo size={24} />
          </Button>
          <Button 
            className="pointer-events-auto rounded-full h-10 w-10 flex items-center justify-center" 
            onClick={redoStroke}
            >
              <CiRedo size={24} />
          </Button>
      </motion.div>
    </div>
  );
}
