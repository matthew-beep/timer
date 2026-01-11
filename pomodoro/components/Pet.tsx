import { PET_CONFIGS } from "@/config/PetConfig";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export const PetRenderer = () => {
  const pet = PET_CONFIGS["rottweiler"];
  
  const [petX, setPetX] = useState(-100);
  const [isMoving, setIsMoving] = useState(true); 

  const currentAction = isMoving ? "walk" : "idle";
  const animation = pet.animations[currentAction] || pet.animations["idle"];

  useEffect(() => {
    setPetX(300);
    const timer = setTimeout(() => {
      setIsMoving(false);
    }, 5000); 
    return () => clearTimeout(timer);
  }, []);

  // Calculate the total width of the strip in pixels
  const totalWidthPx = pet.size * animation.frames;

  return (
    <motion.div
      initial={{ x: 0 }}
      animate={{ x: petX }}
      transition={{ duration: 5, ease: "linear" }}
      className="absolute bottom-0"
    >
 <div 
  key={currentAction} 
  style={{
    width: `${pet.size}px`, 
    height: `${pet.size}px`,
    backgroundImage: `url(${animation.url})`,
    backgroundRepeat: 'no-repeat',
    imageRendering: 'pixelated',
    backgroundSize: `${totalWidthPx}px ${pet.size}px`,
    y: '-1px',
    // --- SIZE LOGIC ---
    // This makes him 2x or 3x bigger without breaking the animation
    transform: `scale(2)`, 
    // This ensures he stays on the "floor" and doesn't float when he grows
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