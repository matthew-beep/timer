"use client";

import { motion } from "framer-motion";
import { useNotesStore, StickyNote } from "@/store/useNotes";
import { useTagsStore } from "@/store/useTags";
import { Button } from "@/components/Button";
import { generateHTML } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import { JSONContent } from "@tiptap/core";
import { useMemo } from "react";
import { IoTrashOutline } from "react-icons/io5";
import { DARK_STICKY_COLORS, LIGHT_STICKY_COLORS } from "@/components/Themes";
import { useThemeStore } from "@/store/useTheme";

interface ListNoteProps extends StickyNote {
  index: number;
}

export default function ListNote({
  index,
  text,
  lastEdited,
  id,
  colorIndex,
  tagIds = []
}: ListNoteProps) {
  const deleteNote = useNotesStore((s) => s.deleteNote);
  const theme = useThemeStore((s) => s.theme);
  const allTags = useTagsStore((s) => s.tags);
  const setExpandedNote = useNotesStore((s) => s.setExpandedNote);
  const noteTags = allTags.filter(t => tagIds.includes(t.id));

  const htmlContent = useMemo(() => {
    try {
      const normalized = (text && typeof text === 'object' && 'type' in text)
        ? text as JSONContent
        : { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: String(text) }] }] };

      // StarterKit ensures we parse bold, italic, lists, etc.
      return generateHTML(normalized, [StarterKit]);
    } catch {
      return "<p></p>";
    }
  }, [text]);

  const bgColor = theme === "dark" ? DARK_STICKY_COLORS[colorIndex] : LIGHT_STICKY_COLORS[colorIndex];

  return (
    <motion.div
      onClick={() => {
        console.log("Open full edit modal for:", id);
        setExpandedNote(id);
      }}
      className="group relative h-32 rounded-2xl border flex flex-col overflow-hidden cursor-pointer transition-all hover:bg-white/[0.03]"
      style={{
        backgroundColor: `${bgColor}`,
        borderColor: `${bgColor}40`,
        backdropFilter: "blur(4px)",
      }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
    >

      <div className="p-3 flex-1 flex flex-col justify-between min-h-0">

        {/* SCALED PREVIEW CONTENT */}
        <div className="flex-1 overflow-hidden relative">
          <div
            /* The 'prose-xs' isn't a default, but we can simulate it with 
               prose-sm and custom leading/font-size to keep styling 
               while fitting more text.
            */
            className="
              prose prose-invert prose-sm 
              max-w-none
              text-[12px] 
              leading-[1.4]
              text-text/90
              line-clamp-3
              pointer-events-none
              /* targeting nested tiptap elements directly */
              [&_p]:my-0 
              [&_ul]:my-1 [&_ol]:my-1
              [&_li]:my-0
              [&_h1]:text-sm [&_h2]:text-sm [&_h3]:text-sm
              [&_h1]:my-1 [&_h2]:my-1
            "
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
            <div 
              className="absolute bottom-0 left-0 w-full h-full pointer-events-none"
              style={{
                background: `linear-gradient(to bottom, transparent, ${bgColor})`,
              }}
            />        
          </div>

        {/* BOTTOM SECTION */}
        <div className="mt-2 flex items-center justify-between">
          <div className="flex flex-wrap gap-1 max-w-[70%]">
            {noteTags.map(tag => (
              <span
                key={tag.id}
                className="text-[9px] px-1.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-text/50"
              >
                {tag.name}
              </span>
            ))}
          </div>

          <Button
            variant="plain"
            className="h-7 w-7 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-500/20 hover:text-red-400 transition-all"
            onClick={(e) => {
              e.stopPropagation();
              deleteNote(id);
            }}
          >
            <IoTrashOutline size={14} />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}