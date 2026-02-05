import { useTimer } from "@/store/useTimer";
import { TimerController } from "@/components/TimerController";
import { Button } from "./Button";
import { useEffect, useRef } from "react";
import { RiExpandDiagonalFill } from "react-icons/ri";
import { usePetStore } from "@/store/usePetStore";
import { PET_CONFIGS } from "@/config/PetConfig";

export default function TimerToolbar() {
  const timeRemaining = useTimer((s) => s.timeRemaining);
  const mode = useTimer((s) => s.mode);
  const setMode = useTimer((s) => s.setMode);
  const isRunning = useTimer((s) => s.isRunning);

  const audioRef = useRef<HTMLAudioElement>(null)
  const duration = useTimer((s) => s.duration);

  const progress = 1 - timeRemaining / duration;
  const toggleCollapsed = useTimer(s => s.toggleCollapsed);
  const justCompleted = useTimer(s => s.justCompleted);
  const complete = useTimer(s => s.complete);
  const clearCompletion = useTimer(s => s.clearCompletion);
  const start = useTimer(s => s.start);

  const method = useTimer(s => s.method);

  const minutes = Math.floor(timeRemaining / 60)
    .toString()
    .padStart(2, "0");

  const seconds = (timeRemaining % 60).toString().padStart(2, "0");


  useEffect(() => {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    
    document.title = `${formattedTime} | Study Space`;
    
    // Reset title when component unmounts
    return () => {
      document.title = 'Study Space';
    };
  }, [timeRemaining, isRunning, mode]);

  useEffect(() => {
    if (!justCompleted) return;
    audioRef.current?.play().catch(console.error);
  }, [justCompleted]);

  useEffect(() => {
    if (!justCompleted) return;
    const activePets = usePetStore.getState().activePets;
    const showDialogue = usePetStore.getState().showDialogue;
    if (activePets.length === 0) return;
    const randomPetId = activePets[Math.floor(Math.random() * activePets.length)];
    const pet = PET_CONFIGS[randomPetId as keyof typeof PET_CONFIGS];
    if (pet?.dialogue?.onTimer?.length) {
      const text = pet.dialogue.onTimer[Math.floor(Math.random() * pet.dialogue.onTimer.length)];
      showDialogue(randomPetId, text, 3000);
    }
  }, [justCompleted]);


  return (
    <div className="flex flex-row items-center w-auto justify-center rounded-full bg-cardBg/90 backdrop-blur-md border-white/10 border font-display gap-3 px-4 py-2 shadow-lg">
      {/* Compact timer display */}
      <h3 
        className="text-xl font-bold tabular-nums tracking-tight text-text"
        style={{
          fontVariantNumeric: "tabular-nums",
          fontFeatureSettings: "'tnum'",
        }}
      >
        {minutes}:{seconds}
      </h3>

      {/* Timer controls */}
      <TimerController />
      
      <audio 
        ref={audioRef} 
        src="/sounds/small-dog.wav" 
        onEnded={() => {
          complete();
          clearCompletion();
          start();
        }}
      />

      {/* Expand button */}
      <Button 
        variant="plain" 
        className="rounded-full p-1.5 hover:bg-white/10 transition-colors" 
        onClick={toggleCollapsed}
      >
        <RiExpandDiagonalFill size={16} />
      </Button>
    </div>
  );
}
