import { useState } from "react";
import { useNotesStore } from "@/store/useNotes";
import { useThemeStore } from "@/store/useTheme";
import { DARK_STICKY_COLORS, LIGHT_STICKY_COLORS } from "@/components/Themes";

const colors = [
    '#111928',
    '#FDE68A', // yellow
  '#A7F3D0', // mint
  '#BAE6FD', // sky
  '#C7D2FE', // periwinkle
  '#E9D5FF', // lavender
  '#FBCFE8', // pink
  "#FFD6A5", // peach
];




export default function StickyColorPicker({id, bgColor} : {id: string, bgColor: string}) {

    const [color, setColor] = useState<string>(bgColor);
    const [showModal, setShowModal] = useState<boolean>(false);
    const updateNote = useNotesStore((s) => s.updateNote);
    const theme = useThemeStore((s) => s.theme);

    const stickyColors = theme === "dark" ? DARK_STICKY_COLORS : LIGHT_STICKY_COLORS;

    return (
        <div 
            className="flex items-center gap-1 rounded-full h-4 w-4 relative border cursor-pointer"
            onClick={() => setShowModal(!showModal)}
            style={{
                backgroundColor: color
            }}
        >
            {showModal && (
                <div className="
                    absolute
                    bottom-full
                    right-0
                    mb-2
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
                    {stickyColors.map((c) => (
                        <div
                            key={c}
                            className={`w-4 h-4 rounded-full border-2 border-white/10 cursor-pointer hover:scale-110 transition-transform duration-200 ease-in-out ${c}`}
                            style={{ backgroundColor: c }}
                            onClick={() => {
                                setColor(c);
                                updateNote(id, { color: c });
                            }}
                        />
                    ))}
                </div>
            )}

        </div>
    );
}