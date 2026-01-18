import { ReactSketchCanvasRef } from "react-sketch-canvas";
import { motion } from "framer-motion";
import { Button } from "./Button";
import { CiUndo, CiRedo } from "react-icons/ci";
import { useState, useRef, useEffect } from "react";
import { RxEraser } from "react-icons/rx";
import ColorPickerButton from "./ColorPickerButton";

interface StickyCanvasToolbarProps {
  canvasRef: React.RefObject<ReactSketchCanvasRef | null>;
  strokeColor: string;
  setStrokeColor: (color: string) => void;
  eraserMode: boolean;
  setEraserMode: (value: boolean) => void;
  disableEraser: () => void;
}

export default function StickyCanvasToolbar({
    canvasRef,
    strokeColor,
    setStrokeColor,
    eraserMode,
    setEraserMode,
    disableEraser,
    }: StickyCanvasToolbarProps) {

    const undoStroke = () => {
        if (!canvasRef.current) return;
        canvasRef.current.undo();
    }

    const redoStroke = () => {
        if (!canvasRef.current) return;
        canvasRef.current.redo();
    }

    const eraserModeOn = () => {
    if (!canvasRef.current) return;
        canvasRef.current.eraseMode(true);
        setEraserMode(true);
    }

    const eraserModeOff = () => {
    if (!canvasRef.current) return;
        canvasRef.current.eraseMode(false);
        setEraserMode(false);
    }





    return (
        <motion.div
          className="w-full absolute bottom-0 left-1/2 -translate-x-1/2 flex p-1 gap-1 border-t border-border"
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}

        >
          <ColorPickerButton 
                strokeColor={strokeColor} 
                setStrokeColor={(color) => {
                    setStrokeColor(color)
                    disableEraser()
                }
                } 
                onClick={disableEraser} 
            />

          <div className={`flex items-center gap-1 h-10 w-10 ${eraserMode ? 'bg-white/10 rounded-full' : ''}`}>
            <Button
              className="pointer-events-auto rounded-full h-full w-full flex items-center justify-center"
              onClick={eraserMode ? eraserModeOff : eraserModeOn}
              variant="plain"
            >
              <RxEraser size={24} />
            </Button>
          </div>
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
    );
}