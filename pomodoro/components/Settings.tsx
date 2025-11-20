"use client";

import { useRef, ChangeEvent, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/Card";
import Draggable from "react-draggable";
import { useTimer } from "@/store/useTimer";


// TODO: Refactor to use react-rnd instead of draggable
export default function Settings({ onClose }: { onClose: () => void }) {
  // Use a nodeRef to avoid react-dom.findDOMNode (not available/allowed in some React runtimes)

  const durations = useTimer((s) => s.durations);
  const setDurationValue = useTimer((s) => s.setDurationValue);
  const nodeRef = useRef<HTMLDivElement>(null);

  return (
    // Pass nodeRef to Draggable and attach the ref to the actual DOM node child
    <Draggable handle=".settings-handle" nodeRef={nodeRef}>
      <div ref={nodeRef} className="fixed top-16 right-4 z-50">
        <motion.div
          style={{
            width: "16rem",
            transformOrigin: "top right",
          }}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ duration: 0.1, ease: "easeOut" }}
        >
          <Card className="p-6 w-full bg-[var(--card)] text-[var(--timer-fg)] shadow-lg rounded-xl">
            <div className="settings-handle flex justify-between items-center mb-4 cursor-move">
              <h2 className="text-xl font-semibold">Settings</h2>
              <button
                onClick={onClose}
                className="text-sm text-gray-400 hover:text-gray-100"
              >
                ✕
              </button>
            </div>
            <div>
              <div className="flex flex-col">            
                <label htmlFor="my-input">Work Timer Duration:</label>
                <input
                    id="my-input"
                    type="text"
                    value={durations.focus / 60}
                    onChange={(e) => setDurationValue("focus", Number(e.target.value))}
                    placeholder="Type here"
                    className="border-2 rounded-md p-2"
                />
              </div>
              <div className="flex flex-col">            
                <label htmlFor="my-input">Break Timer Duration:</label>
                <input
                    id="my-input"
                    type="text"
                    value={durations.short / 60}
                    onChange={(e) => setDurationValue("short", Number(e.target.value))}
                    placeholder="Type here"
                    className="border-2 rounded-md p-2"
                />
              </div>

            </div>
          </Card>
        </motion.div>
      </div>
    </Draggable>
  );
}
