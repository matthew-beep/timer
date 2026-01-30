"use client";

import Timer from "@/components/Timer";
import Header from "@/components/Header";
import { PetRenderer } from "@/components/Pet";
import ProgressBar from "@/components/Progress";
import Settings from "@/components/Settings";
import { useEffect, useState } from "react";


import { useAuthStore } from "@/store/useAuth";
import NotesContainer from "@/components/NotesContainer";
import AuthModal from "@/components/AuthModal";
import Overlay from "@/components/Overlay";
import MergeNotesModal from "@/components/MergeNotesModal";
import { useTimer } from "@/store/useTimer";
import { motion, AnimatePresence } from "motion/react";
import { useNotesStore } from "@/store/useNotes";
import ExpandedNote from "@/components/ExpandedNote";

export default function Home() {
  const [showSettings, setShowSettings] = useState(false);

  const { user, session, isLoading } = useAuthStore();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const collapsed = useTimer((s) => s.collapsed);
  const isNoteExpanded = useNotesStore((s) => s.isNoteExpanded);
  useEffect(() => {
    console.log("user changed: ", user);
    console.log("session changed: ", session);
    console.log("isLoading changed: ", isLoading);
  }, [user, isLoading, session]);

  return (
    <>
      <Header showSettings={showSettings} setShowSettings={setShowSettings} setShowAuthModal={setShowAuthModal} showAuthModal={showAuthModal} />
      <div className="relative h-full">
        <NotesContainer />

        <div
          className="w-fit mx-auto flex flex-col items-center justify-center h-full z-0 relative p-10"
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
                className="w-full h-full relative"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{
                  opacity: 0,
                  scale: 0.9,
                  transition: { duration: 0.25 }
                }}
                transition={{ duration: 0.3 }}
              >
                <PetRenderer id="turtle" scale={1} />
                <PetRenderer id="rottweiler" scale={2} />
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
          {!collapsed && <div className="w-full h-full"></div>}

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


        <MergeNotesModal />


        <ProgressBar />
      </div>
    </>
  );
}
