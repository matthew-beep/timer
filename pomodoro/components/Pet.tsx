"use client";

import { useMemo, useEffect, useRef } from "react";
import { PET_CONFIGS } from "@/config/PetConfig";
import { motion } from "motion/react";
import { PetProps } from "@/config/PetConfig";
import { usePetBehavior } from "@/hooks/usePetBehavior";
import { usePetTalking } from "@/hooks/usePetTalking";
import { useTimer } from "@/store/useTimer";
import { usePetStore } from "@/store/usePetStore";
import { SpeechBubble } from "@/components/SpeechBubble";

const defaultContainerWidth =
  typeof window !== "undefined" ? window.innerWidth : 800;

export const PetRenderer = ({ id, scale, containerWidth }: Partial<PetProps>) => {
  const activePets = usePetStore((s) => s.activePets);
  const selectedPetId = id || activePets[0] || 'rottweiler';
  const pet = PET_CONFIGS[selectedPetId];

  const finalScale = scale ?? pet.defaultScale ?? 1;

  const timerMode = useTimer((s) => s.mode);
  const petMode = timerMode === 'focus' ? 'focus' : 'break';

  const effectiveWidth = containerWidth ?? defaultContainerWidth;
  const {
    currentAction,
    x,
    direction,
    duration,
    onAnimationComplete,
    isInitialized,
  } = usePetBehavior(selectedPetId, petMode, effectiveWidth);

  // ✅ Dialogue state
  const currentDialogue = usePetStore((s) => s.currentDialogue);
  const showDialogue = usePetStore((s) => s.showDialogue);
  const isTalking = usePetTalking(selectedPetId);
  
  const isThisPetSpeaking = currentDialogue?.petId === selectedPetId;

  // ✅ Handle pet click
  const handlePetClick = () => {
    if (!pet.dialogue?.onClick) return;
    
    const dialogues = pet.dialogue.onClick;
    const randomDialogue = dialogues[Math.floor(Math.random() * dialogues.length)];
    showDialogue(selectedPetId, randomDialogue, 3000);
  };

  // ✅ Show spawn dialogue (one time)
  const hasShownSpawnDialogue = useRef(false);
  useEffect(() => {
    if (!hasShownSpawnDialogue.current && pet.dialogue?.onSpawn && isInitialized) {
      hasShownSpawnDialogue.current = true;
      const dialogues = pet.dialogue.onSpawn;
      const randomDialogue = dialogues[Math.floor(Math.random() * dialogues.length)];
      
      // Show after a brief delay
      setTimeout(() => {
        showDialogue(selectedPetId, randomDialogue, 4000);
      }, 800);
    }
  }, [isInitialized, selectedPetId, pet.dialogue, showDialogue]);

  // Override action when talking so we show talk sprite
  const effectiveAction =
    isTalking && pet.animations["talk"] ? "talk" : currentAction;

  // Animation from effectiveAction so idle/talk/walk all show correct sprite
  const animation = useMemo(() => {
    return pet.animations[effectiveAction] ?? pet.animations["idle"];
  }, [effectiveAction, pet]);

  const totalWidthPx = pet.size * animation.frames;
  const spriteRef = useRef<HTMLDivElement>(null);

  // Slower sprite cycle: talk=fast, walk=tied to move duration (min 0.6s), else config speed
  const spriteSpeed =
    effectiveAction === "talk"
      ? 0.35
      : effectiveAction === "walk"
        ? Math.max(0.6, duration / 2)
        : animation.speed;

  useEffect(() => {
    if (!spriteRef.current) return;
    spriteRef.current.style.animation = "none";
    void spriteRef.current.offsetHeight;
    spriteRef.current.style.animation = "";
  }, [effectiveAction, animation.url]);

  return (
    <motion.div
      onClick={handlePetClick}
      animate={{ x, opacity: isInitialized ? 1 : 0 }}
      transition={
        duration === 0
          ? { x: { duration: 0 }, opacity: { duration: 0.2 } }
          : {
              x: { duration, ease: duration > 0.5 ? "linear" : "easeOut" },
              opacity: { duration: 0.2 },
            }
      }
      onAnimationComplete={onAnimationComplete}
      className="absolute bottom-0 z-10 cursor-pointer hover:brightness-110"
    >
      {/* Speech bubble outside flip wrapper so text is never mirrored */}
      <SpeechBubble
        text={currentDialogue?.text ?? ""}
        isVisible={isThisPetSpeaking}
        position="top"
      />
      {/* Direction flip only on the sprite, not the bubble */}
      <div
        style={{
          transform: `scaleX(${direction === "left" ? -1 : 1})`,
          transformOrigin: "bottom center",
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
          key={`${effectiveAction}-${animation.url}`}
        />
      </div>
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