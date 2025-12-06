"use client";

import { ReactSketchCanvas } from "react-sketch-canvas";
import { PropsWithChildren } from "react";

export function CanvasWrapper({ children }: PropsWithChildren) {
  return (
    <div className="relative w-full h-screen overflow-hidden border-yellow-500 bg-orange-100">
      {/* The canvas layer */}
      <ReactSketchCanvas
        className="absolute inset-0 z-0"
        strokeWidth={4}
        strokeColor="black"
        style={{
          border: "none",
          width: "100%",
          height: "100%",
        }}
        canvasColor="red"
      />

      {/* Your page content sits ON TOP */}
      {true &&
      <div className="relative z-10 pointer-events-auto">
        {children}
      </div>
}
    </div>
  );
}