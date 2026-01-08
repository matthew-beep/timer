"use client";

import { useRef, useState } from "react";
import Draggable from "react-draggable";
import { useTimer } from "@/store/useTimer";
import { IoIosClose } from "react-icons/io";
import { Button } from "./Button";
import { useThemeStore } from "@/store/useTheme";
import { Theme, themes } from "@/components/Themes";


// TODO: Refactor to use react-rnd instead of draggable
export default function Settings({ onClose, showSettings, setShowSettings }: { onClose?: () => void, showSettings: boolean, setShowSettings: (show: boolean) => void }) {
  const durations = useTimer((s) => s.durations);
  const setDurationValue = useTimer((s) => s.setDurationValue);
  const nodeRef = useRef<HTMLDivElement>(null);
  const workColor = useThemeStore((s) => s.colors.work);
  const breakColor = useThemeStore((s) => s.colors.break);
  const updateColor = useThemeStore((s) => s.updateColor);
  const selectedGradient = useThemeStore((s) => s.selectedGradient);
  const updateSelectedGradient = useThemeStore((s) => s.updateSelectedGradient);

  const [workTimerLength, setWorkTimerLength] = useState("");
  const [breakTimerLength, setBreakTimerLength] = useState("");

  const applyTheme = (theme: Theme) => {
    const body = document.body;
    body.style.setProperty('--c-0', theme.colors.c0)
    body.style.setProperty('--c-1', theme.colors.c1)
    body.style.setProperty('--c-2', theme.colors.c2)
    body.style.setProperty('--c-3', theme.colors.c3)
    body.style.setProperty('--c-4', theme.colors.c4)
    body.style.setProperty('--c-5', theme.colors.c5)
    updateSelectedGradient(theme.name);
  }

  return (
    // Pass nodeRef to Draggable and attach the ref to the actual DOM node child
    <Draggable 
      handle=".settings-handle" 
      nodeRef={nodeRef as React.RefObject<HTMLElement>}
    >
      <div ref={nodeRef} className="fixed top-20 right-4 bg-[#1C1C1E]/80 backdrop-blur-xl rounded-3xl border border-white/40 shadow-2xl space-6 pb-6 overflow-hidden">
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
            <div className="gap-4 flex flex-col px-6 text-xs">
              <div className="flex flex-col gap-2">            
                <label htmlFor="work-timer" className="tracking-wider text-xs text-white font-medium">WORK DURATION:</label>
                <input
                    id="work-timer"
                    type="text"
                    value={workTimerLength}
                    onChange={(e) => {setWorkTimerLength(e.target.value); setDurationValue("focus", Number(e.target.value))}}
                    placeholder={`${durations.focus / 60}`}
                    className="p-2 active:outline-none focus:ring-2 focus:ring-blue-500 bg-[#252527] placeholder:text-[#A9A9AB] text-white rounded-full border border-[#4C4B53] outline-none"
                />
              </div>
              <div className="flex flex-col gap-2">            
                <label htmlFor="break-timer" className="tracking-wider text-xs text-white font-medium">BREAK DURATION:</label>
                <input
                    id="break-timer"
                    type="text"
                    value={breakTimerLength}
                    onChange={(e) => {setBreakTimerLength(e.target.value); setDurationValue("short", Number(e.target.value))}}
                    placeholder={`${durations.short / 60}`}
                    className="p-2 active:outline-none focus:ring-2 focus:ring-blue-500 bg-[#252527] placeholder:text-[#A9A9AB] text-white rounded-full border border-[#4C4B53] outline-none"
                />
              </div>
              <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent mt-2" />
            <div>
              <div className="space-y-3 flex flex-col gap-1">
                <label className="text-xs font-medium text-white tracking-wider">
                  COLOR THEME
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {themes.map((theme) => (
                    <button
                      key={theme.name}
                      className={`relative flex flex-col justify-center group p-3 rounded-xl border transition-all border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20`}
                      onClick={() => {
                        console.log("applying theme", theme.name)
                        applyTheme(theme)
                      }}
                    >
                      <div className="flex gap-1 mb-2">
                        {theme.preview.map((color, i) => (
                          <div
                            key={i}
                            className="flex-1 h-6 w-6 rounded-md"
                            style={{
                              backgroundColor: color,
                            }}
                          />
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/70 font-medium">
                          {theme.name}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              {/* custom color 
              <div className="flex w-full justify-between">
                <input
                  type="color"
                  id="work-color"
                  className="w-8 h-8 cursor-pointer"
                  value={workColor}
                  onChange={(e) => {
                    updateColor("work", e.target.value);
                  }}
                />
                <input
                  type="color"
                  id="work-color"
                  className="w-8 h-8 cursor-pointer"
                  value={workColor}
                  onChange={(e) => {
                    updateColor("work", e.target.value);
                  }}
                />
                <input
                  type="color"
                  id="work-color"
                  className="w-8 h-8 cursor-pointer"
                  value={workColor}
                  onChange={(e) => {
                    updateColor("work", e.target.value);
                  }}
                />
                <input
                  type="color"
                  id="work-color"
                  className="w-8 h-8 cursor-pointer"
                  value={workColor}
                  onChange={(e) => {
                    updateColor("work", e.target.value);
                  }}
                />
            </div>
            */}
            <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent mt-5" />

            </div>
              <div className="flex items-center w-full justify-between">
                <label htmlFor="work-color" className="mr-2">Work Color</label>
                <input
                  type="color"
                  id="work-color"
                  className="w-8 h-8 cursor-pointer"
                  value={workColor}
                  onChange={(e) => {
                    updateColor("work", e.target.value);
                  }}
                />
              </div>
              <div className="flex items-center w-full justify-between">
                <label htmlFor="break-color" className="mr-2">Break Color</label>
                <input
                  type="color"
                  id="break-color"
                  className="w-8 h-8 cursor-pointer"
                  value={breakColor}
                  onChange={(e) => {
                    updateColor("break", e.target.value);
                  }}
                />
            </div>
          </div>
      </div>
    </Draggable>
  );
}
