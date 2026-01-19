"use client";

import type { CanvasPath } from "react-sketch-canvas";

interface StaticCanvasProps {
  paths?: string;
  width?: number;
  height?: number;
}

export default function StaticCanvas({
  paths = "",
}: StaticCanvasProps) {

  return (
    <div 
      className="w-full h-full relative border-amber-500"
      dangerouslySetInnerHTML={{ __html: paths }}
    >

    </div>
  );
}