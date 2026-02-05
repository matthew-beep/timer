"use client";

import { useState, useEffect } from "react";
import { useTimer } from "@/store/useTimer";
import { useThemeStore } from "@/store/useTheme";
import { theme1 as themes } from "@/components/Themes";
import Modal, { ModalSection, ModalDivider } from "@/components/Modal";
import { Button } from "@/components/Button";
import { BACKGROUND_CONFIGS } from "@/config/BackgroundConfig";
import { Switch } from "@mui/material";
import { motion } from "framer-motion";
import { POMODORO } from "@/store/useTimer";
import Image from "next/image";

import { PET_CONFIGS, PetId } from "@/config/PetConfig";
import { usePetStore } from "@/store/usePetStore";

type TabType = 'timer' | 'theming' | 'pets'

export default function Settings({
  showSettings,
  setShowSettings
}: {
  showSettings: boolean;
  setShowSettings: (show: boolean) => void;
}) {

  const method = useTimer((s) => s.method);
  const setPomodoro = useTimer((s) => s.setPomodoro);
  const setCambridge = useTimer((s) => s.setCambridge);

  const durations = useTimer((s) => s.durations);
  const setDurationValue = useTimer((s) => s.setDurationValue);

  const updateSelectedGradient = useThemeStore((s) => s.updateSelectedGradient);
  const selectedTheme = useThemeStore((s) => s.theme);
  const updateTheme = useThemeStore((s) => s.updateTheme);

  const backgroundMode = useThemeStore((s) => s.backgroundMode);
  const updateBackgroundMode = useThemeStore((s) => s.updateBackgroundMode);
  const updateSelectedBackground = useThemeStore((s) => s.updateSelectedBackground);
  const selectedBackground = useThemeStore((s) => s.selectedBackground);
  const selectedGradient = useThemeStore((s) => s.selectedGradient);
  const [settingsBackgroundMode, setSettingsBackgroundMode] = useState(backgroundMode);
  const [settingsTheme, setSettingsTheme] = useState(selectedTheme);

  const [activeTab, setActiveTab] = useState<TabType>('timer')
  const [localDurations, setLocalDurations] = useState<{ [key: string]: string }>({});

  const activePets = usePetStore((s) => s.activePets);

  const tabs = [
    {
      id: 'timer' as TabType,
      label: 'Timer',
    },
    {
      id: 'theming' as TabType,
      label: 'Theming',
    },
    {
      id: 'pets' as TabType,
      label: 'Pets',
    },
  ]

  return (
    <Modal
      title="Settings"
      isOpen={showSettings}
      onClose={() => setShowSettings(false)}
      width={320}
      defaultX={typeof window !== 'undefined' ? window.innerWidth - 320 - 20 : 100}
      defaultY={80}
      maxHeight="max-h-[70vh]"
      className=""
    >

      <div
        className={`flex border-b border-border/10 w-full`}
      >
        {tabs.map((tab) => {

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`cursor-pointer flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-all relative ${activeTab === tab.id ? "text-text" : "text-text/40 hover:text-text/70"}`}
            >

              <span>{tab.label}</span>
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className={`absolute bottom-0 left-0 right-0 h-0.5 bg-text`}
                />
              )}
            </button>
          )
        })}
      </div>
      {/* Timer Duration Section */}
      {activeTab === 'timer' && (
        <ModalSection>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium tracking-wider">
              {method.name === 'Pomodoro' ? 'Pomodoro' : 'Cambridge'}
            </label>
            <Switch
              // Compare by name string instead of object reference
              checked={method.name === 'Pomodoro'}
              onChange={(e) => {
                if (e.target.checked) {
                  setPomodoro();
                } else {
                  setCambridge();
                }
              }}
              size="small"
            />
          </div>
          {Object.entries(durations).map(([mode, seconds]) => {
            // Determine what value to show: local typing state or the store value
            const displayValue = localDurations[mode] !== undefined
              ? localDurations[mode]
              : Math.floor(seconds / 60).toString();

            return (
              <div key={mode} className="flex flex-col gap-2">
                <label htmlFor={`${mode}-timer`} className="tracking-wider text-xs font-medium">
                  {mode.toUpperCase()} DURATION
                </label>

                <input
                  id={`${mode}-timer`}
                  type="number"
                  value={displayValue}
                  onFocus={() => {
                    // Optional: select all text on focus for easier editing
                  }}
                  onChange={(e) => {
                    const val = e.target.value;

                    // Allow the user to clear the input
                    setLocalDurations(prev => ({ ...prev, [mode]: val }));

                    // Only update the store if there's a valid number > 0
                    const numVal = Number(val);
                    if (val !== "" && !isNaN(numVal) && numVal > 0) {
                      setDurationValue(mode, numVal);
                    }
                  }}
                  onBlur={() => {
                    // Cleanup: Remove local state so it snaps back to store value 
                    // (handles cases where user left it blank)
                    setLocalDurations(prev => {
                      const next = { ...prev };
                      delete next[mode];
                      return next;
                    });
                  }}
                  className="p-2 active:outline-none focus:ring-2 focus:ring-blue-500 bg-[var(--inputBg)] placeholder:text-[var(--placeholder)] text-text rounded-full border border-border outline-none"
                />
              </div>
            );
          })}

          <label className="text-xs font-medium tracking-wider mb-3 block">
            SESSION COLORS
          </label>
          <div className="grid grid-cols-2 gap-4">
            {/* Work Color */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-text/60 uppercase tracking-widest">
                Work
              </label>
              <div className="flex items-center gap-2 bg-[var(--inputBg)] p-1.5 rounded-full border border-border">
                <input
                  type="color"
                  value={useThemeStore.getState().colors.work}
                  onChange={(e) => useThemeStore.getState().updateColor('work', e.target.value)}
                  className="w-6 h-6 rounded-full overflow-hidden border-none bg-transparent cursor-pointer"
                />
                <span className="text-xs font-mono uppercase truncate">
                  {useThemeStore.getState().colors.work}
                </span>
              </div>
            </div>

            {/* Break Color */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-text/60 uppercase tracking-widest">
                Break
              </label>
              <div className="flex items-center gap-2 bg-[var(--inputBg)] p-1.5 rounded-full border border-border">
                <input
                  type="color"
                  value={useThemeStore.getState().colors.break}
                  onChange={(e) => useThemeStore.getState().updateColor('break', e.target.value)}
                  className="w-6 h-6 rounded-full overflow-hidden border-none bg-transparent cursor-pointer"
                />
                <span className="text-xs font-mono uppercase truncate">
                  {useThemeStore.getState().colors.break}
                </span>
              </div>
            </div>
          </div>
        </ModalSection>
      )}

      {activeTab === 'theming' && (
        <>
          <ModalSection>
            <label className="text-xs font-medium tracking-wider mb-2 block">
              BACKGROUND
            </label>
            <div className="glass-plain rounded-md flex items-center gap-1 p-1 mb-4">
              <Button
                variant='plain'
                className={`p-2 rounded-lg w-full`}
                onClick={() => setSettingsBackgroundMode("mesh")}
                isActive={settingsBackgroundMode === "mesh"}
              >
                Gradient
              </Button>
              <Button
                variant='plain'
                className={`p-2 rounded-lg w-full`}
                onClick={() => setSettingsBackgroundMode("video")}
                isActive={settingsBackgroundMode === "video"}
              >
                Static
              </Button>
            </div>
          </ModalSection>

          {/* Video Background Section */}
          {settingsBackgroundMode === "video" ? (
            <ModalSection>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium tracking-wider">
                  {selectedTheme === 'dark' ? 'DARK MODE' : 'LIGHT MODE'}
                </label>
                <Switch
                  checked={selectedTheme === "dark"}
                  onChange={(e) => {
                    const newTheme = e.target.checked ? "dark" : "light";
                    updateTheme(newTheme);
                    setSettingsTheme(newTheme);
                  }}
                  size="small"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {BACKGROUND_CONFIGS.map((bg, i) => {
                  const isSelected = backgroundMode === "video" && selectedBackground === i;
                  return (
                    <button
                      key={bg.name}
                      className={`
                        pb-1 relative flex flex-col justify-center items-center overflow-hidden rounded-xl transition-all
                        ${isSelected ? "bg-text/10" : "bg-text/5 hover:bg-text/10"}
                      `}
                      onClick={() => {
                        updateBackgroundMode("video");
                        updateSelectedBackground(i);
                      }}
                    >
                      <Image
                        src={bg.thumbnail}
                        alt={bg.name}
                        width={1000}
                        height={1000}
                        className="rounded-md mb-2 object-cover w-full h-full"
                      />
                      <span className="text-xs">{bg.name}</span>
                    </button>
                  );
                })}
              </div>
            </ModalSection>
          ) : (
            <ModalSection>
              <label className="text-xs font-medium tracking-wider mb-2 block">
                COLOR THEME
              </label>
              <div className="glass-plain rounded-md flex items-center gap-1 p-1 mb-4">
                <Button
                  variant='plain'
                  className={`p-2 rounded-lg w-full`}
                  onClick={() => setSettingsTheme("dark")}
                  isActive={settingsTheme === "dark"}
                >
                  Dark
                </Button>
                <Button
                  variant='plain'
                  className={`p-2 rounded-lg w-full`}
                  onClick={() => setSettingsTheme("light")}
                  isActive={settingsTheme === "light"}
                >
                  Light
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {themes.filter((theme) => theme.mode === settingsTheme).map((theme) => {
                  const gradientIndex = themes.indexOf(theme);
                  const isSelected = backgroundMode === "mesh" && selectedGradient === gradientIndex;
                  return (
                    <button
                      key={theme.name}
                      className={`
                        relative flex flex-col justify-center items-center group p-3 rounded-xl transition-all
                        ${isSelected ? "bg-text/10" : "bg-text/5 hover:bg-text/10"}
                      `}
                      onClick={() => {
                        updateBackgroundMode("mesh");
                        updateSelectedGradient(gradientIndex);
                        updateTheme(settingsTheme);
                      }}
                    >
                      <div className="flex gap-1 mb-2">
                        {theme.preview.map((color, i) => (
                          <div
                            key={i}
                            className="h-6 w-6 rounded-md"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-text/70 font-medium">
                        {theme.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </ModalSection>
          )}
        </>
      )}


      {activeTab === 'pets' && (
        <ModalSection>
          <div className="grid grid-cols-2 gap-4">
            {Object.values(PET_CONFIGS).map((pet) => {
              const isActive = usePetStore.getState().activePets.includes(pet.id);

              return (
                <button
                  key={pet.id}
                  onClick={() => usePetStore.getState().togglePet(pet.id as PetId)}
                  className={`
                    flex flex-col items-center gap-3 p-4 rounded-xl transition-all
                    ${isActive
                      ? 'bg-text/10'
                      : 'bg-text/5 border-transparent hover:bg-text/10'
                    }
                  `}
                >
                  <div
                    className="w-16 h-16"
                    style={{
                      backgroundImage: `url(${pet.animations.idle.url})`,
                      backgroundSize: `${pet.size * pet.animations.idle.frames}px 100%`,
                      imageRendering: 'pixelated',
                      backgroundPosition: '0 0'
                    }}
                  />
                  <div className="text-center">
                    <p className="text-sm font-medium capitalize">{pet.id}</p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-6 p-3 bg-text/5 rounded-lg text-xs text-text/60 text-center">
            <p>Pets behave differently during <strong>Focus</strong> and <strong>Break</strong> modes!</p>
          </div>
        </ModalSection>
      )}
    </Modal>
  );
}