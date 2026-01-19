import { useEffect, useRef, useState } from "react";
import { HexColorPicker } from "react-colorful";
import { Button } from "./Button";
import { LiaPaintBrushSolid } from "react-icons/lia";
import { motion } from "framer-motion";

export default function ColorPickerButton({ strokeColor, setStrokeColor, onClick } : { strokeColor: string; setStrokeColor: (color: string) => void; onClick?: () => void }) {
  const [showPicker, setShowPicker] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
    const handleMouseDownOutside = (event: MouseEvent) => {
        if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
        ) {
        setShowPicker(false);
        }
    };

    document.addEventListener("mousedown", handleMouseDownOutside);
    return () => {
        document.removeEventListener("mousedown", handleMouseDownOutside);
    };
    }, []);

  return (
    <div ref={containerRef} className="relative flex items-center">
      {/* Brush Button */}
      <Button
        className="rounded-full h-10 w-10 flex items-center justify-center"
        variant="plain"
        onClick={() => {
            setShowPicker((prev) => !prev)
            onClick?.()
        }}
      >
        <LiaPaintBrushSolid color={strokeColor} size={24} />
      </Button>

      {/* Color Picker Popover */}
      {showPicker && (
        <motion.div 
            className="absolute bottom-12 left-0 z-50"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
        >
          <HexColorPicker
            color={strokeColor}
            onChange={setStrokeColor}
            className="rounded-xl shadow-lg bg-cardBg"
          />
        </motion.div>
      )}
    </div>
  );
}
