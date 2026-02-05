import { useEffect, useState } from "react";
import { usePetStore } from "@/store/usePetStore";

export function usePetTalking(petId: string): boolean {
  const currentDialogue = usePetStore((s) => s.currentDialogue);
  const [isTalking, setIsTalking] = useState(false);

  useEffect(() => {
    if (currentDialogue?.petId === petId) {
      setIsTalking(true);
      const words = currentDialogue.text.split(/\s+/).length;
      const talkDuration = Math.min(words * 200 + 500, 3500);
      const timer = setTimeout(() => setIsTalking(false), talkDuration);
      return () => clearTimeout(timer);
    } else {
      setIsTalking(false);
    }
  }, [currentDialogue, petId]);

  return isTalking;
}
