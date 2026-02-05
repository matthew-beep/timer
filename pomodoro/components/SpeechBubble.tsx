"use client";

import { motion, AnimatePresence } from "motion/react";

interface SpeechBubbleProps {
  text: string;
  isVisible: boolean;
  position?: "top" | "bottom";
}

export function SpeechBubble({
  text,
  isVisible,
  position = "top",
}: SpeechBubbleProps) {
  return (
    <AnimatePresence>
      {isVisible && text && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: position === "top" ? 10 : -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className={`absolute left-1/2 -translate-x-1/2 z-20 pointer-events-none ${
            position === "top" ? "-top-14" : "-bottom-14"
          }`}
        >
          <div className="bg-cardBg/95 backdrop-blur-sm rounded-xl px-4 py-2 shadow-lg border border-border min-w-[100px] max-w-[200px] text-center">
            <p className="text-sm text-text font-medium whitespace-pre-line leading-snug">
              {text}
            </p>
          </div>
          <div
            className={`absolute left-1/2 -translate-x-1/2 w-0 h-0 border-8 border-transparent ${
              position === "top"
                ? "bottom-0 translate-y-full border-t-cardBg border-l-transparent border-r-transparent"
                : "top-0 -translate-y-full border-b-cardBg border-l-transparent border-r-transparent"
            }`}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
