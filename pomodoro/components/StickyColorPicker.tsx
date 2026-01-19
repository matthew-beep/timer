import { useState } from "react";
import { useNotesStore } from "@/store/useNotes";
import { useThemeStore } from "@/store/useTheme";
import { DARK_STICKY_COLORS, LIGHT_STICKY_COLORS } from "@/components/Themes";

export default function StickyColorPicker({id, colorIndex } : {id: string, colorIndex: number }) {

    
    const [showModal, setShowModal] = useState<boolean>(false);
    const updateNote = useNotesStore((s) => s.updateNote);
    const theme = useThemeStore((s) => s.theme);

    const stickyColors = theme === "dark" ? DARK_STICKY_COLORS : LIGHT_STICKY_COLORS;
    const color = stickyColors[colorIndex] || stickyColors[0];
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
                                //setColor(c);
                                // lets check first if the index != current index
                                const newIndex = stickyColors.indexOf(c);
                                if (newIndex === colorIndex) return;

                                updateNote(id, { colorIndex: stickyColors.indexOf(c) });
                            }}
                        />
                    ))}
                </div>
            )}

        </div>
    );
}