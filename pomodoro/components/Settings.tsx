"use client";

import { useRef, ChangeEvent, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/Card";
import Draggable from "react-draggable";

export default function Settings({ onClose }: { onClose: () => void }) {
  // Use a nodeRef to avoid react-dom.findDOMNode (not available/allowed in some React runtimes)
    const [inputValue, setInputValue] = useState('');

    // Define a function to handle changes in the input field
    const handleChange = (event:ChangeEvent<HTMLInputElement>) => {
        setInputValue(event.target.value); // Update the state with the new input value
    };
  const nodeRef = useRef<HTMLDivElement>(null);

  return (
    // Pass nodeRef to Draggable and attach the ref to the actual DOM node child
    <Draggable handle=".settings-handle" nodeRef={nodeRef}>
      <div ref={nodeRef} className="fixed top-16 right-4 z-50">
        <motion.div
          style={{
            width: "32rem",
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
            <label htmlFor="my-input">Enter text:</label>
            <input
                id="my-input"
                type="text"
                value={inputValue} // Bind the input's value to the state variable
                onChange={handleChange} // Attach the handleChange function to the onChange event
                placeholder="Type here"
            />
            </div>
          </Card>
        </motion.div>
      </div>
    </Draggable>
  );
}
