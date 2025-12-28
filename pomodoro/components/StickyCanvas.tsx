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
import StaticCanvas from "./StaticCanvas";
import { IoCheckmarkOutline } from "react-icons/io5";
import { CiEdit } from "react-icons/ci";
import { Slider } from "@mui/material";

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
  inlineSvg?: string;
}

export default function StickyCanvas({
  id = "",
  paths= [],
  inlineSvg = "",
}: StickyCanvasProps) {

  const canvasRef = useRef<ReactSketchCanvasRef>(null);
  const updateNote = useNotesStore((s) => s.updateNote);
  const [strokeWidth, setStrokeWidth] = useState<number>(2);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editCanvas, setEditCanvas] = useState<boolean>(false);
  const activeNoteId = useNotesStore(s => s.activeNoteId);
  const isActive = activeNoteId === id;
  const [strokeColor, setStrokeColor] = useState<string>("#FFFFFF");  

  useEffect(() => { 
    if (canvasRef.current && paths.length > 0) {
      canvasRef.current.loadPaths(paths);
    }
  }, [editCanvas, paths]);

  /*

  useEffect(() => {
    if (!canvasRef.current) return;
    console.log("isActive changed: ", isActive, " for note id: ", id);
    if (!isActive) {
      console.log("disabling edit mode for note id: ", id);
      canvasRef.current.eraseMode(false);
    }
  }, [isActive]);
*/

  const saveEditCanvas = async (editMode:boolean) => {
    

    console.log("saveEditCanvas called with editMode: ", editMode);
    if (editMode) {
      if (!canvasRef.current) return;
      try {
        const paths = await canvasRef.current.exportPaths();
        const svgElement = await canvasRef.current.exportSvg();
        console.log("Saved paths: ", paths);
        console.log("inline: ", svgElement);
        updateNote(id, { paths, inlineSvg: svgElement });
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

    const eraserModeOff = () => {
    if (!canvasRef.current) return;
    canvasRef.current.eraseMode(false);
  }




  
  return (
    <div className="w-full h-full relative outline-none overflow-hidden">

      {/* Top Bar */}

      <div 
        className="h-12 absolute top-0 right-0 width-full flex rounded-full p-1 bg-[#0a1929]/80 m-2 z-10"
      > 
        <Button 
          className="pointer-events-auto rounded-full h-10 w-10 flex items-center justify-center" 
          onClick={() => {
            saveEditCanvas(editCanvas);
            eraserModeOff();
          }}
          variant="plain"
          >{editCanvas ? <IoCheckmarkOutline size={24} /> : <CiEdit size={24} />}
        </Button>
      </div>

      {editCanvas ? 
      <ReactSketchCanvas
        id={`sticky-canvas-${id}`}
        ref={canvasRef}
        strokeWidth={2}
        strokeColor={strokeColor}
        style={{ border: "none" }}
        className={`w-full h-full border-none ${editCanvas ? "pointer-events-auto" : "pointer-events-none"}`}
        canvasColor="rgba(255, 255, 255, 0)"
      /> :

        <StaticCanvas paths={inlineSvg} />
      } 
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
            value={strokeColor}
            onChange={(e) => setStrokeColor(e.target.value)}
          />
          <Button 
            className="pointer-events-auto rounded-full h-10 w-10 flex items-center justify-center relative" 
            variant="plain"
            onMouseEnter={() => setShowModal(true)}
            onMouseLeave={() => setShowModal(false)}
            >
              {showModal && <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#0a1929]/90 rounded-xl flex flex-col items-center w-96"><Slider /></div>}
              |
          </Button>
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
