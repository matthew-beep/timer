import { PET_CONFIGS } from "@/config/PetConfig";
import { motion } from "framer-motion";
import { PetProps } from "@/config/PetConfig";
import { usePetBehavior } from "@/hooks/usePetBehavior";
import { useTimer } from "@/store/useTimer";
import { usePetStore } from "@/store/usePetStore";

export const PetRenderer = ({ id, scale }: Partial<PetProps>) => {
  const activePets = usePetStore(s => s.activePets);
  // Default to first active pet if no ID provided, or fallback to rottweiler safe-guard
  const selectedPetId = id || activePets[0] || 'rottweiler';
  const pet = PET_CONFIGS[selectedPetId];

  const finalScale = scale || pet.defaultScale || 1;

  const timerMode = useTimer(s => s.mode);
  // Map timer modes to pet modes (focus/break)
  const petMode = (timerMode === 'focus') ? 'focus' : 'break';

  // Hardcoded for now to match Timer width (420px) minues padding
  const { currentAction, x, direction, duration } = usePetBehavior(selectedPetId, petMode, 420);

  const animation = pet.animations[currentAction] || pet.animations["idle"];
  const totalWidthPx = pet.size * animation.frames;

  return (
    <motion.div
      animate={{ x }}
      transition={{ duration: duration, ease: "linear" }}
      className="absolute bottom-0 z-10"
      style={{
        scaleX: direction === 'left' ? -1 : 1, // Flip sprite
      }}
    >
      <div
        key={`${selectedPetId}-${currentAction}`}
        style={{
          width: `${pet.size}px`,
          height: `${pet.size}px`,
          backgroundImage: `url(${animation.url})`,
          backgroundRepeat: 'no-repeat',
          imageRendering: 'pixelated',
          backgroundSize: `${totalWidthPx}px ${pet.size}px`,
          transform: `scale(${finalScale})`,
          transformOrigin: 'bottom center',
          '--total-width': `-${totalWidthPx}px`,
          '--steps': animation.frames,
          '--speed': `${animation.speed}s`,
        } as React.CSSProperties}
        className="sprite-animate"
      />
      <style jsx global>{`
        .sprite-animate {
          animation: move-strip var(--speed) steps(var(--steps)) infinite;
        }
        @keyframes move-strip {
          from { background-position-x: 0px; }
          to { background-position-x: var(--total-width); }
        }
      `}</style>
    </motion.div>
  );
};
