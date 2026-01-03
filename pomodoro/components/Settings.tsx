"use client";

import { useRef, useState } from "react";
import Draggable from "react-draggable";
import { useTimer } from "@/store/useTimer";
import { IoIosClose } from "react-icons/io";
import { Button } from "./Button";
import { useThemeStore } from "@/store/useTheme";


// TODO: Refactor to use react-rnd instead of draggable
export default function Settings({ onClose, showSettings, setShowSettings }: { onClose?: () => void, showSettings: boolean, setShowSettings: (show: boolean) => void }) {
  const durations = useTimer((s) => s.durations);
  const setDurationValue = useTimer((s) => s.setDurationValue);
  const nodeRef = useRef<HTMLDivElement>(null);

  const workColor = useThemeStore((s) => s.colors.work);
  const breakColor = useThemeStore((s) => s.colors.break);
  const updateColor = useThemeStore((s) => s.updateColor);
  
  return (
    // Pass nodeRef to Draggable and attach the ref to the actual DOM node child
    <Draggable 
      handle=".settings-handle" 
      nodeRef={nodeRef as React.RefObject<HTMLElement>}
    >
      <div ref={nodeRef} className="fixed top-20 right-4 bg-[#0a1929]/80 backdrop-blur-xl rounded-3xl border border-white/40 shadow-2xl space-6 pb-6 overflow-hidden">
            <div className="settings-handle flex justify-between items-center mb-4 cursor-move py-3 px-6 text-white bg-white/5 hover:bg-white/10">
              <h2 className="text-xl font-semibold">Settings</h2>
              <Button
                onClick={() => {setShowSettings(!showSettings)}}
                className="text-sm rounded-full"
                variant="plain"
              >
                <IoIosClose size={24} />
              </Button>
            </div>
            <div className="gap-4 flex flex-col px-6 text-white">
              <div className="flex flex-col">            
                <label htmlFor="my-input">Work Timer Duration:</label>
                <input
                    id="my-input"
                    type="text"
                    value={durations.focus / 60}
                    onChange={(e) => setDurationValue("focus", Number(e.target.value))}
                    placeholder="Type here"
                    className="p-2 active:outline-none focus:ring-2 focus:ring-blue-500 bg-[#181818] rounded-full border border-[#313131] outline-none"
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
                    className="p-2 active:outline-none focus:ring-2 focus:ring-blue-500 bg-[#181818] rounded-full border border-[#313131] outline-none"
                />
              </div>
            <input
              type="color"
              className="w-10 h-10 cursor-pointer"
              value={workColor}
              onChange={(e) => {
                updateColor("work", e.target.value);
              }}
            />
            <input
              type="color"
              className="w-10 h-10 cursor-pointer"
              value={breakColor}
              onChange={(e) => {
                updateColor("break", e.target.value);
              }}
            />
            </div>

      </div>
    </Draggable>
  );
}
