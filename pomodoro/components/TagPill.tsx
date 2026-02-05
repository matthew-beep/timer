"use client";

import React, { useState } from 'react';
import { IoIosClose } from "react-icons/io";
import { motion, AnimatePresence } from 'framer-motion';
import { useTagsStore } from '@/store/useTags'; // Adjust path as needed

interface TagPillProps {
  tagId: string;
  name: string;
  onRemove?: () => void;
  className?: string;
  color: string;
  id: string; // For legacy removeTagFromNote fallback (noteId or tagId depending on caller)
  compact?: boolean;
}

export const TagPill: React.FC<TagPillProps> = ({
  tagId,
  name,
  onRemove,
  className = "",
  color,
  id,
  compact = true,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const { removeTagFromNote } = useTagsStore(); // Get the deleteTag function


  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        backgroundColor: `${color}15`, // ~8% opacity
        color: color,
        borderColor: `${color}30`
      }}
      className={`
        inline-flex items-center gap-1 rounded-full border font-semibold tracking-wide
        transition-all duration-200 select-none relative overflow-hidden 
        ${compact ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-sm"}
        ${className} ${isHovered && "shadow-md pr-1"}
      `}
    >
      <span className={compact ? "truncate max-w-[80px]" : "truncate max-w-[140px]"}>{name}</span>

      <AnimatePresence>
        {isHovered && (
          <motion.button
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "auto", opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            onClick={(e) => {
              e.stopPropagation();
              if (onRemove) {
                onRemove();
              } else {
                // Legacy: remove tag from a specific note when no custom handler is provided
                removeTagFromNote(id, tagId);
              }
            }}
            className="flex items-center justify-center hover:bg-black/10 rounded-sm transition-colors"
          >
            <IoIosClose size={16} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};
