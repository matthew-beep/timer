"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";

interface OverlayProps {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
    contentClassName?: string;
    blur?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | "none";
}

export default function Overlay({ isOpen, onClose, children, contentClassName, blur = "xs" }: OverlayProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className={`fixed inset-0 bg-black/20 z-40 backdrop-blur-${blur}`}
                    />

                    {/* Content panel */}
                    <motion.div
                        className="fixed top-0 left-0 w-full h-full z-50 pointer-events-none" // pointer-events-none to let clicks pass through empty areas if needed, but children should re-enable
                    >
                        {/* Wrapper to re-enable pointer events for the actual content and handle animation */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -20 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="pointer-events-auto flex justify-center items-center h-full w-full" // Re-enable pointer events
                        >
                            {children}
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
