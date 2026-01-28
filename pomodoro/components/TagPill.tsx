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
  id: string;
}

export const TagPill: React.FC<TagPillProps> = ({
  tagId,
  name,
  onRemove,
  className = "",
  color,
  id
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
        inline-flex items-center gap-1 px-2.5 py-0.5 
        rounded-full border text-[10px] font-semibold tracking-wide
        transition-all duration-200 select-none relative overflow-hidden 
        ${className} ${isHovered && "shadow-md pr-1"}
      `}
    >
      <span className="truncate max-w-[80px]">{name}</span>

      <AnimatePresence>
        {isHovered && (
          <motion.button
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "auto", opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            onClick={() => removeTagFromNote(id, tagId)} // Handle deletion on click
            className="flex items-center justify-center hover:bg-black/10 rounded-sm transition-colors"
          >
            <IoIosClose size={16} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};
