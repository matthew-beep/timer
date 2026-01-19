"use client";

import { motion } from "framer-motion";
import { useNotesStore } from "@/store/useNotes";
import { Button } from "@/components/Button";
import { generateHTML } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import { JSONContent } from "@tiptap/core";
import { useMemo } from "react";
import { StickyNote } from "@/store/useNotes";
import { IoTrashOutline } from "react-icons/io5";

interface ListNoteProps extends StickyNote {
  index: number;
}

const normalizeNoteText = (text: unknown): JSONContent => {
  if (text && typeof text === "object" && "type" in text) {
    return text as JSONContent;
  }

  if (!text || (typeof text === "object" && Object.keys(text).length === 0)) {
    return { type: "doc", content: [{ type: "paragraph" }] };
  }

  if (typeof text === "string") {
    return {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: text ? [{ type: "text", text }] : [],
        },
      ],
    };
  }

  return { type: "doc", content: [{ type: "paragraph" }] };
};

export default function ListNote({
  index,
  text,
  color,
  lastEdited,
  id,
}: ListNoteProps) {
  const deleteNote = useNotesStore((s) => s.deleteNote);

  const htmlContent = useMemo(() => {
    try {
      const normalizedText = normalizeNoteText(text);
      return generateHTML(normalizedText, [StarterKit]);
    } catch {
      return "<p></p>";
    }
  }, [text]);

  const formatNoteDate = (dateInput: string | number | Date) => {
    const date = new Date(dateInput);
    const now = new Date();

    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    return isToday
      ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : date.toLocaleDateString([], { month: "2-digit", day: "2-digit" });
  };

  return (
    <motion.div
      className="relative h-32 rounded-xl border p-2 flex flex-col justify-between"
      style={{
        backgroundColor: `${color}30`,
        borderColor: color,
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      {/* CONTENT PREVIEW */}
      <div className="flex-1 overflow-hidden relative">
        <div
          className="
            prose prose-sm prose-invert
            text-text
            line-clamp-4
            pointer-events-none
          "
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </div>

      {/* FOOTER */}
      <div className="mt-2 flex items-center justify-between">
        {/* TAGS PLACEHOLDER */}
        <div className="flex gap-1">
          {/* future tags go here */}
          {/* <span className="text-xs px-2 py-0.5 rounded-full bg-white/10">tag</span> */}
        </div>

        <div className="flex items-center gap-2">
          {lastEdited && (
            <span className="text-xs text-text/50">
              {formatNoteDate(lastEdited)}
            </span>
          )}

          <Button
            variant="plain"
            className="h-5 w-5 flex items-center justify-center hover:text-red-500"
            onClick={() => deleteNote(id)}
          >
            <IoTrashOutline size={14} />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
