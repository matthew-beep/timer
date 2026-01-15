"use client";

import { useEffect, useRef, useState } from "react";
import { Rnd } from "react-rnd";
import { ReactSketchCanvasRef } from "react-sketch-canvas";
import { IoIosClose } from "react-icons/io";
import { useNotesStore } from "@/store/useNotes";
import { Button } from "./Button";
import type { CanvasPath } from "react-sketch-canvas";
import StickyText from "./StickyText";
import StickyCanvas from "./StickyCanvas";

import { RxText } from "react-icons/rx";
import { BiPaint } from "react-icons/bi";
import { JSONContent } from '@tiptap/core';
import { motion, AnimatePresence } from "motion/react";
import { PiDotsThree } from "react-icons/pi";
import { StickyNote as StickyNoteProps } from "@/store/useNotes";
import { useThemeStore } from "@/store/useTheme";

export default function StickyNote({
  id = "",
  text = { type: 'doc', content: [{ type: 'paragraph' }] },
  color,
  x = 100,
  y = 100,
  width = 300,
  height = 220,
  mode = "text",
  paths = [],
  zIndex = 1,
  inlineSvg = ""
}: StickyNoteProps) {

  const [draw, setDraw] = useState(mode === "draw" ? true : false);
  const deleteNote = useNotesStore((s) => s.deleteNote);
  const updateNote = useNotesStore((s) => s.updateNote);
  const bringNoteToFront = useNotesStore((s) => s.bringNoteToFront);
  const setActiveNote = useNotesStore(s => s.setActiveNote);
  const activeNoteId = useNotesStore(s => s.activeNoteId);
  const activeNote = activeNoteId === id;
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    console.log("sticky color: ", color);
  }, []); // only on mount



  const [cursor, setCursor] = useState<string>("grab");
  const [scale, setScale] = useState<number>(1);
  const [currHeight, setCurrHeight] = useState<number>(height);
  const resizeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  return (
    <Rnd
      position={{ x, y }}
      size={{ width: width, height: height }}
      onDragStop={(e, d) => { updateNote(id, { x: d.x, y: d.y }) }}
      onResizeStop={(e, direction, ref, delta, position) => {
        updateNote(id, {
          width: ref.offsetWidth,
          height: ref.offsetHeight,
          x: position.x,
          y: position.y,
        });
      }}

      onResize={(e, direction, ref) => {
        if (resizeTimeout.current) {
          clearTimeout(resizeTimeout.current);
        }

        resizeTimeout.current = setTimeout(() => {
          setCurrHeight(ref.offsetHeight);
        }, 100); // ← adjust debounce delay (ms)
      }}
      minWidth={300}
      minHeight={200}
      maxWidth={600}
      maxHeight={600}
      dragHandleClassName="sticky-handle"
      bounds="parent"
      className="pointer-events-auto"
      style={{
        display: "flex",
        zIndex: zIndex,
      }}   // important for stretch
      onMouseDown={() => {

        bringNoteToFront(id, zIndex)

      }}
    >
      <AnimatePresence>
        <motion.div
          className="w-full h-full flex bg-cardBg flex-col rounded-lg overflow-hidden shadow-md hover:shadow-2xl transition-all duration-150 relative backdrop-blur-xl font-sans"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          style={{
            border: `1px solid ${color}`,
            scale: scale
          }}
        >

          {/* Header / Handle */}
          <motion.div
            className={`
            sticky-handle flex justify-between items-center 
            font-semibold border-b border-white/5 bg-[var(--stickyHandle)] h-12 p-2
          `}
            style={{ cursor: cursor }}
            onMouseEnter={() => setScale(1.05)}
            onMouseLeave={() => setScale(1)}
            onMouseDown={() => {
              setCursor("grabbing");
              setActiveNote(id);
            }}
            onMouseUp={() => setCursor("grab")}
          >
            <div
              className={`flex items-center gap-1 ${theme === "dark" ? "bg-black/20" : "bg-gray-200"} rounded-md p-1`}
            >
              <button
                className={`cursor-pointer w-8 h-full flex items-center justify-center transition-all duration-150 rounded-sm p-1.5 ${mode === 'draw' ? 'bg-[var(--hoverBg)] text-text' : 'text-text/40 hover:text-text/70'}`}
                onClick={
                  () => {
                    updateNote(id, { mode: "draw" })
                    setDraw(true);
                  }
                }>
                <BiPaint size={14} />
              </button>
              <button
                className={`cursor-pointer w-8 h-full flex items-center justify-center transition-all duration-150 rounded-sm p-1.5 ${mode === 'text' ? 'bg-[var(--hoverBg)] text-text' : 'text-text/40 hover:text-text/70'}`}
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
            <div className="flex items-center">
              <Button
                className="w-8 h-8 flex items-center justify-center transition-all duration-150 rounded-full"
                onClick={() => console.log("More options")}
                variant="plain"
              >
                <PiDotsThree
                  size={24}
                />
              </Button>
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
          </motion.div>

          {/* Content */}
          <div onMouseDown={() => setActiveNote(id)} className="w-full h-full flex">
            {draw ?
              (<StickyCanvas id={id} color={color} paths={paths} inlineSvg={inlineSvg} />)
              :
              (<StickyText id={id} initialText={text} height={currHeight} />)
            }
          </div>

        </motion.div>
      </AnimatePresence>
    </Rnd>
  );
}
