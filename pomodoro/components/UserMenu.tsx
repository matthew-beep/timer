"use client";

import { useAuthStore } from "@/store/useAuth";
import { Button } from "./Button";
import { IoPersonOutline, IoLogOutOutline } from "react-icons/io5";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function UserMenu() {
    const { user, signOut } = useAuthStore();
    const [isOpen, setIsOpen] = useState(false);

    // Extract display name or email
    const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
    const email = user?.email || '';

    return (
        <div
            className="relative border-2"
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
        >
            <Button
                className="flex items-center justify-center p-2 rounded-full"
                // onClick={() => {}} // Click can also toggle if we want, but hover covers it
                isActive={isOpen}
                variant='glassPlain'
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
                        className="absolute right-0 top-full mt-2 w-64 p-2 rounded-2xl bg-cardBg backdrop-blur-md border border-border shadow-xl flex flex-col gap-2 z-50 text-text"
                    >
                        {/* User Info */}
                        <div className="px-3 py-2 border-b border-white/10">
                            <p className="font-medium text-sm truncate">{displayName}</p>
                            <p className="text-xs text-text/50 truncate">{email}</p>
                        </div>

                        {/* Actions */}
                        <Button
                            variant="plain"
                            className="flex items-center gap-2 justify-start px-3 py-2 rounded-xl hover:bg-white/10 text-sm transition-colors text-red-300 hover:text-red-200"
                            onClick={() => signOut()}
                        >
                            <IoLogOutOutline size={16} />
                            Sign Out
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
