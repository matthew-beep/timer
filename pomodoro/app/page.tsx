"use client";

import Timer from "@/components/Timer";
import Header from "@/components/Header";
import { CanvasWrapper } from "@/components/Canvas";
import { useState, useEffect } from "react";
import { ReactSketchCanvas } from "react-sketch-canvas";

export default function Home() {
  const [bgColor, setBgColor] = useState("#1e293b");

  useEffect(() => {
    document.documentElement.style.setProperty("--background", bgColor);
    document.documentElement.style.setProperty("--text-color", "#ffffff");
  }, [bgColor]);

  return (

      <div className="min-h-screen font-sans text-[var(--text-color)]">
        <Header />

        <input
          type="color"
          className="w-10 h-10 cursor-pointer"
          value={bgColor}
          onChange={(e) => {
            const newColor = e.target.value;
            setBgColor(newColor);
            document.documentElement.style.setProperty("--background", newColor);
          }}
        />

        <div className="w-full h-96 flex flex-col items-center justify-center">
          <h1 className="text-6xl">Pomodoro Puppy</h1>
          <Timer />
        </div>
      </div>
  );
}
