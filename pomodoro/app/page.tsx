"use client";

import Timer from "@/components/Timer";
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
  const isNoteExpanded = useNotesStore((s) => s.isNoteExpanded);

  return (
    <>
      <Header showSettings={showSettings} setShowSettings={setShowSettings} setShowAuthModal={setShowAuthModal} showAuthModal={showAuthModal} setRoomModalOpen={setRoomModalOpen} roomModalOpen={roomModalOpen} />
      <div className="relative h-full">
        <NotesContainer />

        <div
          ref={containerRef}
          className="flex flex-col items-center justify-center h-full z-0 relative p-10"
        >
          <AnimatePresence>
            {false && (
              <motion.div
                className="w-full relative"
                initial={{ opacity: 0, scale: 0.9, y: 100 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{
                  opacity: 0,
                  scale: 0.9,
                  transition: { duration: 0.1 }
                }}
                transition={{ duration: 0.3, delay: 1 }}
              >
                <h2 className="text-5xl text-text text-shadow-lg text-shadow-white">The secret of getting ahead is getting started</h2>
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{
                  opacity: 0,
                  y: 10,
                  transition: { duration: 0.25 }
                }}
                transition={{ duration: 0.3, delay: 0.2 }}
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
          <ExpandedNote />
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
