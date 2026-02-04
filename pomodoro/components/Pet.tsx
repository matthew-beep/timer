"use client";

import { useEffect, useRef } from "react";
import { PET_CONFIGS } from "@/config/PetConfig";
import { motion } from "motion/react";
import { PetProps } from "@/config/PetConfig";
import { usePetBehavior } from "@/hooks/usePetBehavior";
import { useTimer } from "@/store/useTimer";
import { usePetStore } from "@/store/usePetStore";

const defaultContainerWidth =
  typeof window !== "undefined" ? window.innerWidth : 800;

export const PetRenderer = ({ id, scale, containerWidth }: Partial<PetProps>) => {
  const activePets = usePetStore((s) => s.activePets);
  const selectedPetId = id || activePets[0] || "rottweiler";
  const pet = PET_CONFIGS[selectedPetId];

  const finalScale = scale ?? pet.defaultScale ?? 1;

  const timerMode = useTimer((s) => s.mode);
  const petMode = timerMode === "focus" ? "focus" : "break";

  const effectiveWidth = containerWidth ?? defaultContainerWidth;
  const {
    currentAction,
    x,
    direction,
    duration,
    onAnimationComplete,
    isInitialized,
  } = usePetBehavior(selectedPetId, petMode, effectiveWidth);

  const animation = pet.animations[currentAction] ?? pet.animations["idle"];
  const totalWidthPx = pet.size * animation.frames;

  const spriteRef = useRef<HTMLDivElement>(null);

  const spriteSpeed =
    currentAction === "walk"
      ? Math.max(0.3, duration / 3)
      : animation.speed;

  useEffect(() => {
    if (!spriteRef.current) return;
    spriteRef.current.style.animation = "none";
    void spriteRef.current.offsetHeight;
    spriteRef.current.style.animation = "";
  }, [currentAction]);

  return (
    <motion.div
      animate={{ x, opacity: isInitialized ? 1 : 0 }}
      transition={{
        duration,
        ease: duration > 0.5 ? "linear" : "easeOut",
        opacity: { duration: 0.2 },
      }}
      onAnimationComplete={onAnimationComplete}
      className="absolute bottom-0 z-10"
      style={{
        scaleX: direction === "left" ? -1 : 1,
      }}
    >
      <div
        ref={spriteRef}
        style={
          {
            width: `${pet.size}px`,
            height: `${pet.size}px`,
            backgroundImage: `url(${animation.url})`,
            backgroundRepeat: "no-repeat",
            imageRendering: "pixelated",
            backgroundSize: `${totalWidthPx}px ${pet.size}px`,
            transform: `scale(${finalScale})`,
            transformOrigin: "bottom center",
            "--total-width": `-${totalWidthPx}px`,
            "--steps": animation.frames,
            "--speed": `${spriteSpeed}s`,
          } as React.CSSProperties
        }
        className="sprite-animate"
      />
      <style jsx global>{`
        .sprite-animate {
          animation: move-strip var(--speed) steps(var(--steps)) infinite;
        }
        @keyframes move-strip {
          from {
            background-position-x: 0px;
          }
          to {
            background-position-x: var(--total-width);
          }
        }
      `}</style>
    </motion.div>
  );
};
