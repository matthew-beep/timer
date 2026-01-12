"use client";

import { useState } from "react";
import { useTimer } from "@/store/useTimer";
import { useThemeStore } from "@/store/useTheme";
import { theme1 as themes } from "@/components/Themes";
import Modal, { ModalSection, ModalDivider } from "@/components/Modal";
import { Button } from "@/components/Button";

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
  const selectedTheme = useThemeStore((s) => s.theme);
  const updateTheme = useThemeStore((s) => s.updateTheme);
  const [settingsTheme, setSettingsTheme] = useState(selectedTheme);

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
          <label htmlFor="work-timer" className="tracking-wider text-xs font-medium">
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
          <label htmlFor="break-timer" className="tracking-wider text-xs font-medium">
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
        <label className="text-xs font-medium tracking-wider">
          COLOR THEME
        </label>
        <div
          className="glass-plain rounded-md flex items-center gap-1 p-1"
        >
          <Button
            variant='plain'
            className={`p-2 rounded-lg w-full`}
            onClick={() => {
              setSettingsTheme("dark");
              // Only update the filter, don't apply gradient
            }}
            isActive={settingsTheme === "dark"}
          >
            Dark
          </Button>
          <Button
            variant='plain'
            className={`p-2 rounded-lg w-full`}
            onClick={() => {
              setSettingsTheme("light");
              // Only update the filter, don't apply gradient
            }}
            isActive={settingsTheme === "light"}
          >
            Light
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {themes.filter((theme) => theme.mode === settingsTheme).map((theme) => (
            <button
              key={theme.name}
              className="relative flex flex-col justify-center items-center group p-3 rounded-xl border border-border transition-all bg-white/5 hover:bg-white/10 hover:border-white/20"
              onClick={() => {
                console.log("applying theme", theme.name);
                // Apply both the gradient AND the light/dark mode
                updateSelectedGradient(themes.indexOf(theme));
                updateTheme(settingsTheme); // Use the current filter selection
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
                <span className="text-xs text-text/70 font-medium">
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