"use client";

import { useEffect, useRef } from "react";
import { ReactSketchCanvas, ReactSketchCanvasRef } from "react-sketch-canvas";
import { useNotesStore } from "@/store/useNotes";
import { Button } from "./Button";
import type { CanvasPath } from "react-sketch-canvas";
import { CiUndo, CiRedo } from "react-icons/ci";
import { motion } from "framer-motion";
import { useState } from "react";
import { RxEraser } from "react-icons/rx";

import { IoCheckmarkOutline } from "react-icons/io5";
import { CiEdit } from "react-icons/ci";
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

  useEffect(() => { 
    if (canvasRef.current && paths.length > 0) {
      canvasRef.current.loadPaths(paths);
    }
  }, []);


  const saveEditCanvas = async (editMode:boolean) => {
    if (!canvasRef.current) return;

    if (editMode) {
      try {
        const paths = await canvasRef.current.exportPaths();
        console.log("Saved paths: ", paths);
        updateNote(id, { paths });
        setEditCanvas(false);
      } catch {
        console.error("Error saving canvas paths");
      }
    } else {
      setEditCanvas(true);
    }

    
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

  const eraserMode = () => {
    if (!canvasRef.current) return;
    canvasRef.current.eraseMode(true);
  }




  
  return (
    <div className="w-full h-full relative outline-none overflow-hidden">

      {/* Top Bar */}

      <div 
        className="h-12 absolute top-0 right-0 width-full flex rounded-full p-1 bg-[#0a1929]/80 m-2"
      > 
        <Button 
          className="pointer-events-auto rounded-full h-10 w-10 flex items-center justify-center" 
          onClick={() => saveEditCanvas(editCanvas)}
          variant="plain"
          >{editCanvas ? <IoCheckmarkOutline size={24} /> : <CiEdit size={24} />}
        </Button>
      </div>
      <ReactSketchCanvas
        ref={canvasRef}
        strokeWidth={2}
        strokeColor="white"
        style={{ border: "none" }}
        className={`w-full h-full border-none ${editCanvas ? "pointer-events-auto" : "pointer-events-none"}`}
        canvasColor="rgba(255, 255, 255, 0)"
      />

      {/* Bottom Toolbar */}

      {editCanvas &&
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
            onClick={eraserMode}
            variant="plain"
            >
              <RxEraser size={24} />
          </Button>
        
          <Button 
            className="pointer-events-auto rounded-full h-10 w-10 flex items-center justify-center" 
            onClick={undoStroke}
            variant="plain"
            >
              <CiUndo size={24} />
          </Button>
          <Button 
            className="pointer-events-auto rounded-full h-10 w-10 flex items-center justify-center" 
            onClick={redoStroke}
            variant="plain"
            >
              <CiRedo size={24} />
          </Button>
      </motion.div>
  }
    </div>
  );
}
