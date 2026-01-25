// components/StickyBottomBar.tsx
"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import StickyTagSelector from "./StickyTagSelector";
import { useTagsStore } from "@/store/useTags";
import { TagPill } from "./TagPill";
import { useNotesStore } from "@/store/useNotes";
import { useThemeStore } from "@/store/useTheme";
import { DARK_STICKY_COLORS, LIGHT_STICKY_COLORS } from "./Themes";
import { LuCheck } from "react-icons/lu";

interface StickyContextMenuProps {
  id: string;
  color: string;
  colorIndex: number;
  tagIds: string[];
}

export default function StickyContextMenu({
  id,
  color,
  colorIndex,
  tagIds
}: StickyContextMenuProps) {
  const theme = useThemeStore((s) => s.theme);
  const stickyColors = theme === "dark" ? DARK_STICKY_COLORS : LIGHT_STICKY_COLORS;
  const tags = useTagsStore((s) => s.tags);
  const updateNote = useNotesStore((s) => s.updateNote);
  return (
    <motion.div 
      className="absolute right-0 text-text backdrop-blur-md shadow-xl z-40"
      initial={{ y: -50 }} // Start higher up behind the header
      animate={{ y: 0 }}   // Slide down to the natural position
      exit={{ y: -100 }}    // Slide back up
      style={{ 
        top: '48px',
        backgroundColor: color 
      }} // Exactly the height of your h-12 header
      transition={{   
        duration: 0.4
      }}
      
    > 
      <div className="flex overflow-x-auto h-full items-center justify-end">
      {stickyColors.map((c) => (
          <div
              key={c}
              className={`h-8 w-8 border-white/10 cursor-pointer transition-transform duration-200 ease-in-out flex items-center justify-center ${c}`}
              style={{ backgroundColor: c }}
              onClick={() => {
                  //setColor(c);
                  // lets check first if the index != current index
                  const newIndex = stickyColors.indexOf(c);
                  if (newIndex === colorIndex) return;

                  updateNote(id, { colorIndex: stickyColors.indexOf(c) });
              }}
          >
            { colorIndex === stickyColors.indexOf(c) && <LuCheck />}
          </div>
      ))}
      </div>      
      
      <div className="p-2 border-t border-white/10 flex gap-2 overflow-x-auto text-right">
        Delete Note
      </div>
    </motion.div>
  );
}