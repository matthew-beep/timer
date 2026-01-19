// components/StickyBottomBar.tsx
"use client";

import { ReactNode } from "react";
import StickyColorPicker from "./StickyColorPicker";
import { motion } from "framer-motion";

interface StickyBottomBarProps {
  children: ReactNode; // The mode-specific toolbar (canvas or text tools)
  id: string;
  colorIndex: number;
  show: boolean; // Only show when note is active & tall enough
}

export default function StickyBottomBar({
  children,
  id,
  colorIndex,
  show,
}: StickyBottomBarProps) {
  if (!show) return null;

  return (
    <motion.div 
        className="absolute bottom-0 left-0 w-full z-20 pointer-events-auto h-auto grow flex-1"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
    >
      <div className="flex items-center justify-between gap-2 border-t border-white/10 p-1">
        {/* Left side: Mode-specific tools */}
        <div className="flex items-center justify-between gap-1 flex-1">
          {children}
        </div>

        {/* Right side: Color picker (shared) */}
        <StickyColorPicker id={id} colorIndex={colorIndex} />
      </div>
    </motion.div>
  );
}