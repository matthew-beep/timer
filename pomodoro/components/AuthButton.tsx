// components/AccountButton.tsx
'use client';

import { useAuthStore } from "@/store/useAuth";
import { Button } from "./Button";
import { IoPersonOutline, IoLogOutOutline, IoCloseOutline } from "react-icons/io5";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AccountButtonProps {
  onSignInClick: () => void;

}

export default function AccountButton({ onSignInClick }: AccountButtonProps) {
  const { user, signOut } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const email = user?.email || '';

  // Guest user - simple click to open auth modal
  if (!user) {
    return (
      <Button
        className="flex items-center justify-center p-2 rounded-full"
        onClick={onSignInClick}
        variant='glassPlain'
      >
        <IoPersonOutline size={18} strokeWidth={0.5} />
      </Button>
    );
  }

  // Authenticated user - show dropdown on hover
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
        tooltip={isOpen ? undefined : (user ? "Profile" : "Sign In")}
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
            className="absolute right-0 top-full mt-2 w-64 rounded-2xl bg-cardBg backdrop-blur-md border border-border shadow-xl z-50 text-text"
          >
            <div>
              <div className="flex justify-end border-2">
                <Button
                  variant="plain"
                  className="flex items-center gap-2 justify-start px-3 py-2 rounded-xl hover:bg-white/10 text-sm transition-colors text-red-300 hover:text-red-200"
                  onClick={() => {
                    setIsOpen(false);
                  }}
                >
                  <IoCloseOutline size={16} />
                </Button>
              </div>
              <div className="p-2 flex flex-col gap-2">
                <div className="px-3 py-2 border-b border-white/10">
                  <p className="font-medium text-sm truncate">{displayName}</p>
                  <p className="text-xs text-text/50 truncate">{email}</p>
                </div>

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
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}