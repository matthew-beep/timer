"use client";

import { ReactNode, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TagPill } from "./TagPill";
import { useTagsStore } from '@/store/useTags';
import { LuTag } from "react-icons/lu";
import { Button } from "./Button";

interface StickyBottomBarProps {
  children: ReactNode;
  id: string;
  show: boolean;
  tagIds: string[];
  color: string;
}

export default function StickyBottomBar({
  children,
  id,
  show,
  tagIds,
  color
}: StickyBottomBarProps) {
  const tags = useTagsStore((s) => s.tags);
  const addTagToNote = useTagsStore((s) => s.addTagToNote);
  const stickyTags = tags.filter(tag => tagIds.includes(tag.id));
  const [isExpanded, setIsExpanded] = useState(false);

  if (!show) return null;

  return (
    <motion.div
      className="absolute bottom-0 left-0 w-full z-30 pointer-events-auto h-auto flex flex-col pt-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      style={{
        /* This is the key: The background itself is the gradient */
        background: `linear-gradient(to bottom, transparent 0%, ${color} 40px, ${color} 100%)`,
      }}
    >
      {/* SECTION 1: SELECTED TAGS */}
      <div className="flex flex-wrap gap-1 px-2 pb-2 items-center min-h-[32px]">
        {stickyTags.length > 0 ? (
          stickyTags.map((tag) => (
            <TagPill key={tag.id} tagId={tag.id} name={tag.name} color={tag.color} id={id}/>
          ))
        ) : (
          <span className="text-[10px] text-text/40 ml-1">No tags assigned</span>
        )}
      </div>

      {/* SECTION 2: THE DRAWER */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-cardBg/5 border-t border-text/10"
          >
            <div className="p-2 flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
              <p className="w-full text-[10px] font-bold text-text/40 uppercase tracking-widest mb-1">
                Add Tags
              </p>
              {tags.map(tag => {
                const isAlreadyTagged = tagIds.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    onClick={() => !isAlreadyTagged && addTagToNote(id, tag.id)}
                    disabled={isAlreadyTagged}
                    className={`text-xs text-text px-2 py-0.5 rounded-full border transition-colors ${isAlreadyTagged
                      ? 'border-text/5 text-text/20'
                      : 'border-text/10 hover:bg-text/10'
                      }`}
                  >
                    + {tag.name}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SECTION 3: TOOLBAR */}
      <div className="flex items-center justify-between gap-2 border-t border-text/10 p-1">
        <div className="flex items-center justify-between gap-1 flex-1">
          {children}
        </div>
        <Button
          className="flex items-center gap-1 rounded-full h-6 w-6 justify-center cursor-pointer p-1"
          onClick={() => setIsExpanded(!isExpanded)}
          variant="plain"
        >
          <LuTag className={isExpanded ? "text-text" : "text-text/60"} />
        </Button>
      </div>
    </motion.div>
  );
}