"use client";

import { useRef, useState, ChangeEvent } from "react";
import Draggable from "react-draggable";


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

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  return (
    <Draggable nodeRef={nodeRef} handle=".sticky-handle">
      <div
        ref={nodeRef}
        className="
          w-60 p-3 rounded-md shadow-lg sticky-note 
          flex flex-col gap-2 select-none cursor-default
          border border-black/10
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
      </div>
    </Draggable>
  );
}
