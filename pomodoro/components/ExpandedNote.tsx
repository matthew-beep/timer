"use client";

import { useState } from "react";
import { useNotesStore } from "@/store/useNotes";
import { useThemeStore } from "@/store/useTheme";
import { Button } from "./Button";
import StickyText from "./StickyText";
import StickyCanvas from "./StickyCanvas";
import StickyContextMenu from "./StickyContextMenu";
import { motion, AnimatePresence } from "motion/react";
import { IoIosClose } from "react-icons/io";
import { RxText } from "react-icons/rx";
import { LuPenTool } from "react-icons/lu";
import { PiDotsThree } from "react-icons/pi";
import { IoTrashOutline } from "react-icons/io5";
import { DARK_STICKY_COLORS, LIGHT_STICKY_COLORS } from "./Themes";

export default function ExpandedNote() {
    const expandedNoteId = useNotesStore((s) => s.expandedNoteId);
    const setExpandedNote = useNotesStore((s) => s.setExpandedNote);
    const notes = useNotesStore((s) => s.notes);
    const updateNote = useNotesStore((s) => s.updateNote);
    const deleteNote = useNotesStore((s) => s.deleteNote);
    const theme = useThemeStore((s) => s.theme);
    const note = notes.find((n) => n.id === expandedNoteId);
    const [contextMenu, setContextMenu] = useState<boolean>(false);
    const [localMode, setLocalMode] = useState<"draw" | "text">(note?.mode || "text");

    if (!note) return null;

    const {
        id,
        text,
        paths = [],
        inlineSvg = "",
        colorIndex = 0,
        tagIds = [],
    } = note;

    const bgColor =
        theme === "dark"
            ? DARK_STICKY_COLORS[colorIndex]
            : LIGHT_STICKY_COLORS[colorIndex];

    const handleClose = () => {
        setExpandedNote(null);
        setContextMenu(false);
    };

    const handleDelete = () => {
        deleteNote(id);
        handleClose();
    };

    const handleModeChange = (newMode: "draw" | "text") => {
        setLocalMode(newMode);
        updateNote(id, { mode: newMode });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center font-sans">
            {/* 1. Backdrop with high-quality blur */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleClose}
                className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />


            {/* 3. Main Modal Container */}
            <motion.div
                className={`w-full max-w-5xl h-[85vh] mx-4 flex flex-col overflow-hidden relative rounded-[32px] border shadow-[0_12px_40px_-12px_rgba(0,0,0,0.25)] ${theme === "dark" ? "bg-zinc-900/95 border-white/10 rotate-[0.5deg]" : "bg-zinc-50 border-zinc-200/80 -rotate-[0.5deg]"}`}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 30, scale: 0.95 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                style={{ 
                    boxShadow: `0 32px 64px -16px ${bgColor}80`,
                    backgroundColor: bgColor
                }}
            >
                {/* Header Section */}
                <div className="flex justify-between items-center px-6 py-4 bg-white/[0.03] border-b border-white/5 shrink-0">
                    {/* Left: Drag handle + Mode Toggle */}
                    <div className="flex items-center gap-3">

                        <div className="flex items-center gap-1 bg-black/30 p-1 rounded-xl border border-white/5">
                        <button
                            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                                localMode === "text"
                                    ? "bg-white/10 text-white shadow-lg"
                                    : "text-neutral-400 hover:text-neutral-200"
                            }`}
                            onClick={() => handleModeChange("text")}
                        >
                            <RxText size={18} />
                            <span>Text</span>
                        </button>
                        <button
                            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                                localMode === "draw"
                                    ? "bg-white/10 text-white shadow-lg"
                                    : "text-neutral-400 hover:text-neutral-200"
                            }`}
                            onClick={() => handleModeChange("draw")}
                        >
                            <LuPenTool size={18} />
                            <span>Draw</span>
                        </button>
                        </div>
                    </div>

                    {/* Right: Action Group */}
                    <div className="flex items-center gap-2 text-text">
                        <Button
                            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/5 transition-colors"
                            onClick={() => setContextMenu(!contextMenu)}
                            variant="plain"
                        >
                            <PiDotsThree size={24} className="text-neutral-400" />
                        </Button>
                        <div className="w-[1px] h-6 bg-white/10 mx-1" />
                        <Button
                            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-red-500/10 text-neutral-400 hover:text-red-400 transition-colors"
                            onClick={handleDelete}
                            variant="plain"
                        >
                            <IoTrashOutline size={20} />
                        </Button>
                        <Button
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                            onClick={handleClose}
                            variant="plain"
                        >
                            <IoIosClose size={28} />
                        </Button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div 
                    className="flex-1 relative overflow-hidden">
                    {/* Context Menu Overlay */}
                    <AnimatePresence>
                        {contextMenu && (
                            <>
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setContextMenu(false)}
                                    className="absolute inset-0 z-40 bg-black/40 backdrop-blur-sm cursor-pointer"
                                />
                                <motion.div 
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="absolute top-4 right-8 z-40"
                                >
                                    <StickyContextMenu
                                        id={id}
                                        color={bgColor}
                                        tagIds={tagIds}
                                        colorIndex={colorIndex}
                                    />
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>

                    {/* Scrollable Editor Wrapper */}
                    <div className="w-full h-full overflow-y-auto py-5 scroll-smooth">
                        <div className="h-full">
                            {localMode === "draw" ? (
                                <StickyCanvas
                                    id={id}
                                    color={bgColor}
                                    paths={paths}
                                    inlineSvg={inlineSvg}
                                    onColorChange={() => {}}
                                    showToolbar={true}
                                    tagIds={tagIds}
                                />
                            ) : (
                                <StickyText
                                    id={id}
                                    initialText={text}
                                    height={800}
                                    color={bgColor}
                                    showToolbar={true}
                                    tagIds={tagIds}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}