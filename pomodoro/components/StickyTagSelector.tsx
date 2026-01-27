import { useState } from "react";
import { useNotesStore } from "@/store/useNotes";
import { useThemeStore } from "@/store/useTheme";
import { useTagsStore } from "@/store/useTags";
import { DARK_STICKY_COLORS, LIGHT_STICKY_COLORS } from "@/components/Themes";
import { Button } from "@/components/Button";
import { LuTag } from "react-icons/lu";
import NoteTagSelector from "./NoteTagSelecter";


export default function StickyTagSelector({id, colorIndex } : {id: string, colorIndex: number }) {

    
    const [showModal, setShowModal] = useState<boolean>(false);
    const updateNote = useNotesStore((s) => s.updateNote);
    const theme = useThemeStore((s) => s.theme);
    const tags = useTagsStore((s) => s.tags);

    const stickyColors = theme === "dark" ? DARK_STICKY_COLORS : LIGHT_STICKY_COLORS;
    return (
        <Button
            className="flex items-center gap-1 rounded-full h-4 w-4 relative cursor-pointer"
            onClick={() => setShowModal(!showModal)}
            variant="plain"
        >
            <LuTag />

            {showModal && (
                <div className="
                    absolute
                    top-full
                    right-0
                    mt-2
                    bg-black
                    text-white
                    rounded-md
                    border
                    border-white/10
                    px-2
                    py-1
                    z-50
                    shadow-lg
                    flex
                    gap-1
                "
                onClick={(e) => {
                    e.stopPropagation();
                }}
                onMouseLeave={() => setShowModal(false)}
                >
                    <NoteTagSelector id={id} />
                </div>
            )}

        </Button>
    );
}