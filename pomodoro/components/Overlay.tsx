"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";

interface OverlayProps {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
    contentClassName?: string;
    blur?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
    slide?: "left" | "right" | "top" | "bottom";
}

export default function Overlay({ isOpen, onClose, children, contentClassName, blur = "xs", slide = "right" }: OverlayProps) {

    const slideVariants = {
        left: { initial: { x: -200, opacity: 0 }, animate: { x: 0, opacity: 1 }, exit: { x: -200, opacity: 0 } },
        right: { initial: { x: 200, opacity: 0 }, animate: { x: 0, opacity: 1 }, exit: { x: 200, opacity: 0 } },
        top: { initial: { y: -200, opacity: 0 }, animate: { y: 0, opacity: 1 }, exit: { y: -200, opacity: 0 } },
        bottom: { initial: { y: 200, opacity: 0 }, animate: { y: 0, opacity: 1 }, exit: { y: 200, opacity : 1 } },
    };
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

                    {/* Content panel - NO FLEX, just a positioned container */}
                    <motion.div
                        initial={slideVariants[slide].initial}
                        animate={slideVariants[slide].animate}
                        exit={{ opacity: 0 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed inset-0 z-50 pointer-events-none"
                        onClick={(e) => e.stopPropagation()} // Prevent clicks from closing when clicking modal
                    >
                        <div className="pointer-events-auto">
                            {children}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

/*

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

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className={`fixed inset-0 bg-black/20 z-40 backdrop-blur-${blur}`}
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed inset-0 z-50 pointer-events-none"
                        onClick={(e) => e.stopPropagation()} // Prevent clicks from closing when clicking modal
                    >
                        <div className="pointer-events-auto">
                            {children}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}


*/