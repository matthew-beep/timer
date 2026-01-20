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

export default function Home() {
  const [showSettings, setShowSettings] = useState(false);

  const { user, session, isLoading } = useAuthStore();
  const [showAuthModal, setShowAuthModal] = useState(false);

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
          <div className="w-full h-full relative">
            <PetRenderer id="turtle" scale={1} />
            <PetRenderer id="rottweiler" scale={2} />
          </div>
          <Timer />
          <div className="w-full h-full"></div>

        </div>

        <Overlay isOpen={showSettings} onClose={() => setShowSettings(false)} slide="right">
          <Settings showSettings={showSettings} setShowSettings={setShowSettings} />
        </Overlay>

        <Overlay isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} blur="xl" slide="top">
          <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
        </Overlay>


        <MergeNotesModal />


        <ProgressBar />
      </div>
    </>
  );
}
