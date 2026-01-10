"use client";

import { useState } from "react";
import { useTimer } from "@/store/useTimer";
import { useThemeStore } from "@/store/useTheme";
import { theme1 as themes } from "@/components/Themes";
import Modal, { ModalSection, ModalDivider } from "@/components/Modal";

export default function Settings({ 
  onClose, 
  showSettings, 
  setShowSettings 
}: { 
  onClose?: () => void;
  showSettings: boolean;
  setShowSettings: (show: boolean) => void;
}) {
  const durations = useTimer((s) => s.durations);
  const setDurationValue = useTimer((s) => s.setDurationValue);
  const workColor = useThemeStore((s) => s.colors.work);
  const breakColor = useThemeStore((s) => s.colors.break);
  const updateColor = useThemeStore((s) => s.updateColor);
  const updateSelectedGradient = useThemeStore((s) => s.updateSelectedGradient);

  const [workTimerLength, setWorkTimerLength] = useState("");
  const [breakTimerLength, setBreakTimerLength] = useState("");

  return (
    <Modal
      title="Settings"
      isOpen={showSettings}
      onClose={() => setShowSettings(false)}
      width="w-80"
      maxHeight="max-h-[70vh] "
      className="fixed top-20 right-4"
    >
      {/* Timer Duration Section */}
      <ModalSection>
        <div className="flex flex-col gap-2">
          <label htmlFor="work-timer" className="tracking-wider text-xs text-white font-medium">
            WORK DURATION:
          </label>
          <input
            id="work-timer"
            type="text"
            value={workTimerLength}
            onChange={(e) => {
              setWorkTimerLength(e.target.value);
              setDurationValue("focus", Number(e.target.value));
            }}
            placeholder={`${durations.focus / 60}`}
            className="p-2 active:outline-none focus:ring-2 focus:ring-blue-500 bg-[#252527] placeholder:text-[#A9A9AB] text-white rounded-full border border-[#4C4B53] outline-none"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="break-timer" className="tracking-wider text-xs text-white font-medium">
            BREAK DURATION:
          </label>
          <input
            id="break-timer"
            type="text"
            value={breakTimerLength}
            onChange={(e) => {
              setBreakTimerLength(e.target.value);
              setDurationValue("short", Number(e.target.value));
            }}
            placeholder={`${durations.short / 60}`}
            className="p-2 active:outline-none focus:ring-2 focus:ring-blue-500 bg-[#252527] placeholder:text-[#A9A9AB] text-white rounded-full border border-[#4C4B53] outline-none"
          />
        </div>
      </ModalSection>

      <ModalDivider />

      {/* Theme Selector Section */}
      <ModalSection>
        <label className="text-xs font-medium text-white tracking-wider">
          COLOR THEME
        </label>
        <div className="grid grid-cols-2 gap-3">
          {themes.map((theme) => (
            <button
              key={theme.name}
              className="relative flex flex-col justify-center group p-3 rounded-xl border transition-all border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20"
              onClick={() => {
                console.log("applying theme", theme.name);
                updateSelectedGradient(themes.indexOf(theme));
              }}
            >
              <div className="flex gap-1 mb-2">
                {theme.preview.map((color, i) => (
                  <div
                    key={i}
                    className="flex-1 h-6 w-6 rounded-md"
                    style={{ backgroundColor: color }}
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
      </ModalSection>

      <ModalDivider />

      {/* Custom Colors Section */}
      <ModalSection>
        <div className="flex items-center w-full justify-between">
          <label htmlFor="work-color" className="mr-2">Work Color</label>
          <input
            type="color"
            id="work-color"
            className="w-8 h-8 cursor-pointer"
            value={workColor}
            onChange={(e) => updateColor("work", e.target.value)}
          />
        </div>
        <div className="flex items-center w-full justify-between">
          <label htmlFor="break-color" className="mr-2">Break Color</label>
          <input
            type="color"
            id="break-color"
            className="w-8 h-8 cursor-pointer"
            value={breakColor}
            onChange={(e) => updateColor("break", e.target.value)}
          />
        </div>
      </ModalSection>
    </Modal>
  );
}