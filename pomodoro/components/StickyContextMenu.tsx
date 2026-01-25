// components/StickyBottomBar.tsx
"use client";

import { ReactNode } from "react";
import StickyColorPicker from "./StickyColorPicker";
import { motion } from "framer-motion";
import StickyTagSelector from "./StickyTagSelector";
import { useTagsStore } from "@/store/useTags";
import { TagPill } from "./TagPill";
import { useNotesStore } from "@/store/useNotes";
import { useThemeStore } from "@/store/useTheme";
import { DARK_STICKY_COLORS, LIGHT_STICKY_COLORS } from "./Themes";

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
  const selectedTags = tags.filter(tag => tagIds.includes(tag.id));
  const updateNote = useNotesStore((s) => s.updateNote);
  return (
    <motion.div 
      className="absolute left-0 w-full text-text backdrop-blur-md shadow-lg z-10"
      initial={{ y: -50 }} // Start higher up behind the header
      animate={{ y: 0 }}   // Slide down to the natural position
      exit={{ y: -100 }}    // Slide back up
      style={{ 
        top: '48px',
        backgroundColor: color 
      }} // Exactly the height of your h-12 header
      transition={{ type: "spring", damping: 25, stiffness: 100 }}
      
    > 
      <div className="flex overflow-x-auto h-full border-2 p-1 items-center justify-center">
      {stickyColors.map((c) => (
          <div
              key={c}
              className={`h-8 w-8 border-2 border-white/10 cursor-pointer transition-transform duration-200 ease-in-out ${c}`}
              style={{ backgroundColor: c }}
              onClick={() => {
                  //setColor(c);
                  // lets check first if the index != current index
                  const newIndex = stickyColors.indexOf(c);
                  if (newIndex === colorIndex) return;

                  updateNote(id, { colorIndex: stickyColors.indexOf(c) });
              }}
          />
      ))}
      </div>      
      
      <div className="border-2">
        {selectedTags.map(tag => (
          <TagPill key={tag.id} tagId={tag.id} name={tag.name} color={tag.color} />
        ))}
      </div>
    </motion.div>
  );
}