// components/AccountButton.tsx
'use client';

import { useAuthStore } from "@/store/useAuth";
import { Button } from "./Button";
import { IoPersonOutline, IoLogOutOutline, IoCloseOutline, IoPeopleOutline, IoLogInOutline } from "react-icons/io5";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AccountButtonProps {
  onSignInClick: () => void;
  onJoinRoomClick: () => void;

}

export default function AccountButton({ onSignInClick, onJoinRoomClick }: AccountButtonProps) {
  const { user, signOut } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);

  // Determine display values based on auth state
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const email = user?.email || '';
  const headerTitle = user ? "Profile" : "Guest";

  return (
    <div
      className="relative"
    >
      <Button
        className="flex items-center justify-center p-2 rounded-full"
        isActive={isOpen}
        variant='glassPlain'
        onClick={() => {
          setIsOpen(!isOpen)
        }}
        tooltip={isOpen ? undefined : (user ? "Profile" : "Account")}
      >
        <IoPersonOutline size={18} strokeWidth={0.5} />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-64 rounded-2xl bg-cardBg backdrop-blur-md border border-border shadow-xl z-50 text-text p-1"
          >
            <div className="flex flex-col">
              <div className="flex justify-between h-auto px-2 py-1 items-center">
                <h4 className="font-semibold text-sm font-sans uppercase">{headerTitle}</h4>
                <Button
                  variant="plain"
                  className="flex items-center gap-2 p-1 justify-start rounded-full hover:bg-white/10 text-sm transition-colors text-red-300 hover:text-red-200 !hover:text-text"
                  onClick={() => {
                    setIsOpen(false);
                  }}
                >
                  <IoCloseOutline size={16} />
                </Button>
              </div>
              <div className="p-2 flex flex-col gap-2">
                <div className="py-2 border-b border-white/10">
                  {user ? (
                    <>
                      <p className="text-sm truncate">{displayName}</p>
                      <p className="text-xs text-text/50 truncate">{email}</p>
                    </>
                  ) : (
                    <p className="text-sm text-text/50">No active user</p>
                  )}
                </div>

                <Button
                  variant="plain"
                  className={`flex items-center gap-2 justify-start px-3 py-2 rounded-xl hover:bg-white/10 text-sm transition-colors text-text`}
                  onClick={() => {
                    onJoinRoomClick();
                    setIsOpen(false);
                  }}
                >
                  <IoPeopleOutline size={16} />
                  Join Room
                </Button>

                {user ? (
                  <Button
                    variant="plain"
                    className="flex items-center gap-2 justify-start px-3 py-2 rounded-xl hover:bg-white/10 text-sm transition-colors text-red-300 hover:text-red-200"
                    onClick={() => {
                      signOut();
                      setIsOpen(false);
                    }}
                  >
                    <IoLogOutOutline size={16} />
                    Sign Out
                  </Button>
                ) : (
                  <Button
                    variant="plain"
                    className="flex items-center gap-2 justify-start px-3 py-2 rounded-xl hover:bg-white/10 text-sm transition-colors text-active"
                    onClick={() => {
                      onSignInClick();
                      setIsOpen(false);
                    }}
                  >
                    <IoLogInOutline size={16} />
                    Sign In
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}