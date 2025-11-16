"use client";

import { useRef, useState, ChangeEvent } from "react";
import Draggable from "react-draggable";
import { ReactSketchCanvas, ReactSketchCanvasRef } from "react-sketch-canvas";


interface StickyNoteProps {
  id: string;
  initialText?: string;
  color?: string;
  onDelete?: (id: string) => void;
}

export default function StickyNote({
  id,
  initialText = "",
  color = "#FFF476", // classic sticky-note yellow
  onDelete,
}: StickyNoteProps) {

  const [text, setText] = useState(initialText);
  const nodeRef = useRef<HTMLDivElement>(null);
  const draw = useState<boolean>(false);
  const canvasRef = useRef<ReactSketchCanvasRef>(null);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  const handleStrokeEnd = async () => {
    if (canvasRef.current) {
      try {
        const paths = await canvasRef.current.exportPaths();
        localStorage.setItem(`sticky-drawing-${id}`, JSON.stringify(paths));
      } catch (error) {
        console.error("Failed to save paths:", error);
      }
    }
  };

  return (
    <Draggable nodeRef={nodeRef} handle=".sticky-handle">
      <div
        ref={nodeRef}
        className="
          w-60 p-3 rounded-md shadow-lg sticky-note 
          flex flex-col gap-2 select-none cursor-default
          border border-black/10 pointer-events-auto
        "
        style={{ backgroundColor: color }}
      >
        {/* Header / Drag Handle */}
        <div
          className="
            sticky-handle w-full flex justify-between items-center
            cursor-move font-semibold text-black/70
          "
        >
          <span className="text-sm">Note</span>
          {onDelete && (
            <button
              onClick={() => onDelete(id)}
              className="text-black/60 hover:text-black"
            >
              X
            </button>
          )}
        </div>

        {/* Editable Text Area */}
        <textarea
          value={text}
          onChange={handleChange}
          className="
            bg-transparent w-full resize-none outline-none
            text-black/80 text-sm leading-relaxed
          "
          rows={6}
        />

      <ReactSketchCanvas
        ref={canvasRef}
        className="inset-0 z-0 border-2"
        strokeWidth={2}
        strokeColor="black"
        onChange={() => {
          console.log("drawing")
        }}
        style={{
          border: "none",
          width: "100%",
          height: "100%",
        }}
        canvasColor="red"
      />
      </div>
    </Draggable>
  );
}
