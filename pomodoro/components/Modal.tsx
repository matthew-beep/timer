"use client";

import { useRef, ReactNode } from "react";
import Draggable from "react-draggable";
import { IoIosClose } from "react-icons/io";
import { Button } from "./Button";

interface ModalProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  width?: string;
  maxHeight?: string;
}

export default function Modal({ 
  title, 
  isOpen, 
  onClose, 
  children,
  className = "",
  width = "w-80",
  maxHeight = "max-h-[70vh]"
}: ModalProps) {
  const nodeRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  return (
    <Draggable 
      handle=".modal-handle" 
      nodeRef={nodeRef as React.RefObject<HTMLElement>}
    >
      <div 
        ref={nodeRef} 
        className={`font-sans bg-cardBg backdrop-blur-xs saturate-80 rounded-3xl border border-border shadow-2xl overflow-hidden ${width} ${className}`}
      >
        {/* Header */}
        <div className="modal-handle flex justify-between items-center cursor-move py-3 px-6 text-text bg-white/5 hover:bg-white/10 transition-colors">
          <h2 className="text-xl font-semibold">{title}</h2>
          <Button
            onClick={onClose}
            className="text-sm rounded-full hover:bg-white/10 transition-all"
            variant="plain"
          >
            <IoIosClose size={24} />
          </Button>
        </div>

        {/* Content */}
        <div 
          className={`flex flex-col gap-6 overflow-y-auto ${maxHeight} py-4 px-6`}
          >
          {children}
        </div>
      </div>
    </Draggable>
  );
}

// Optional: Export helper components for consistent styling
export const ModalSection = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <div className={`flex flex-col gap-4 text-text ${className}`}>
    {children}
  </div>
);

export const ModalDivider = () => (
  <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
);