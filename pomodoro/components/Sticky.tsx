"use client";

import { useRef, useState } from "react";
import { Rnd } from "react-rnd";
import { ReactSketchCanvas, ReactSketchCanvasRef } from "react-sketch-canvas";
import { IoIosClose } from "react-icons/io";

export default function StickyNote({
  id="",
  initialText = "",
  color = "#FFF476",
}) {
  const [text, setText] = useState(initialText);
  const [draw, setDraw] = useState(false);
  const canvasRef = useRef<ReactSketchCanvasRef>(null);

  return (
    <Rnd
      default={{
        x: 100,
        y: 100,
        width: 220,
        height: 220,
      }}
      minWidth={160}
      minHeight={160}
      maxWidth={600}
      maxHeight={600}
      dragHandleClassName="sticky-handle"
      bounds="parent"
      className="rounded-md shadow-lg overflow-hidden pointer-events-auto"
    >
      <div
        style={{ backgroundColor: color }}
        className="w-full h-full flex flex-col"
      >
        {/* Header / Handle */}
        <div
          className="
            sticky-handle cursor-move flex justify-between items-center 
            p-3 font-semibold text-black/70 bg-black/5
          "
        >
          <span className="text-sm">{id}</span>

          <div className="flex gap-2">
            <button onClick={() => setDraw(!draw)}>draw</button>
            <button className="rounded-full text-black/60 hover:text-black">
              <IoIosClose size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        {!draw && (
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="bg-transparent w-full h-full resize-none outline-none p-3 text-black/80 text-sm"
          />
        )}

        {draw && (
          <ReactSketchCanvas
            ref={canvasRef}
            strokeWidth={2}
            strokeColor="black"
            className="w-full h-full"
          />
        )}
      </div>
    </Rnd>
  );
}
