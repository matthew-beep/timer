"use client";

import Timer from "@/components/Timer";
import TimerToolbar from "@/components/TimerToolbar";
import Header from "@/components/Header";
import { PetRenderer } from "@/components/Pet";
import ProgressBar from "@/components/Progress";
import Settings from "@/components/Settings";
import { useEffect, useState, useRef, useLayoutEffect } from "react";


import { useAuthStore } from "@/store/useAuth";
import NotesContainer from "@/components/NotesContainer";
import AuthModal from "@/components/AuthModal";
import Overlay from "@/components/Overlay";
import MergeNotesModal from "@/components/MergeNotesModal";
import { useTimer } from "@/store/useTimer";
import { motion, AnimatePresence } from "motion/react";
import { useNotesStore } from "@/store/useNotes";
import ExpandedNote from "@/components/ExpandedNote";
import RoomModal from "@/components/RoomModal";

import { usePetStore } from "@/store/usePetStore";

export default function Home() {
  const [showSettings, setShowSettings] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [roomModalOpen, setRoomModalOpen] = useState<boolean>(false);
  const collapsed = useTimer((s) => s.collapsed);
  const timeRemaining = useTimer((s) => s.timeRemaining);
  const duration = useTimer((s) => s.duration);
  const isNoteExpanded = useNotesStore((s) => s.isNoteExpanded);
  const expandedNoteId = useNotesStore((s) => s.expandedNoteId);

  const showNotch = collapsed && typeof timeRemaining === "number" && typeof duration === "number";

  return (
    <>
      <Header showSettings={showSettings} setShowSettings={setShowSettings} setShowAuthModal={setShowAuthModal} showAuthModal={showAuthModal} setRoomModalOpen={setRoomModalOpen} roomModalOpen={roomModalOpen} />
      {/* Header notch: when timer is minimized */}
      <AnimatePresence>
        {showNotch && (
          <motion.div
            key="timer-notch"
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
            transition={{ type: "spring", damping: 20, stiffness: 120 }}
            className="fixed top-0 left-1/2 -translate-x-1/2 z-50 pt-2"
          >
            <div className=" px-4 py-2">
              <div className="text-[1.2rem] font-display tabular-nums">
                <TimerToolbar />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="relative h-full">
        <NotesContainer />

        <div
          ref={containerRef}
          className="flex flex-col items-center justify-center h-full z-0 relative p-10"
        >
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.div
                key="full-timer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
                transition={{ duration: 0.3 }}
              >
                <Timer />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Overlay isOpen={showSettings} onClose={() => setShowSettings(false)} slide="right">
          <Settings showSettings={showSettings} setShowSettings={setShowSettings} />
        </Overlay>

        <Overlay isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} blur="xl" slide="top">
          <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
        </Overlay>

        <Overlay isOpen={isNoteExpanded} onClose={() => useNotesStore.getState().setExpandedNote(null)} blur="xl" slide="top">
          <ExpandedNote key={expandedNoteId ?? "none"} />
        </Overlay>

        <Overlay isOpen={roomModalOpen} onClose={() => setRoomModalOpen(false)} blur="xl" slide="top">
          <RoomModal isOpen={roomModalOpen} onClose={() => setRoomModalOpen(false)} />
        </Overlay>



        <MergeNotesModal />


        <ProgressBar />
      </div>
    </>
  );
}
