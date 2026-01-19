"use client";

import { useRef, ReactNode, useState } from "react";
import { Rnd } from "react-rnd";
import { IoIosClose } from "react-icons/io";
import { Button } from "./Button";

interface ModalProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  width?: string | number;
  height?: string | number;
  defaultX?: number;
  defaultY?: number;
  maxHeight?: string;
  disableDragging?: boolean;
  enableResizing?: boolean;
  centered?: boolean;
  enableClose?: boolean;
}

export default function Modal({
  title,
  isOpen,
  onClose,
  children,
  className = "",
  width = 320,
  height,
  defaultX = 100,
  defaultY = 100,
  maxHeight = "max-h-[70vh]",
  disableDragging = false,
  enableResizing = true,
  centered = false,
  enableClose = true,
}: ModalProps) {
  if (!isOpen) return null;


  if (centered) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
        <div className="pointer-events-auto">
          <div
            className={`font-sans bg-cardBg backdrop-blur-xs saturate-80 rounded-3xl border border-border shadow-2xl overflow-hidden flex flex-col`}
            style={{ width: typeof width === 'number' ? `${width}px` : width }}
          >
            {/* Header */}
            <div className="font-display flex justify-between items-center px-6 py-4 text-text border-b border-border">
              <h2 className="text-md font-medium tracking-wide uppercase">{title}</h2>

              {enableClose && ( 
                <Button
                  onClick={onClose}
                  className="text-sm rounded-full hover:bg-white/10 transition-all"
                  variant="plain"
                >
                  <IoIosClose size={24} />
                </Button>
              )}
            </div>

            {/* Content */}
            <div className={`flex flex-col gap-6 overflow-y-auto ${maxHeight} py-4 px-6 flex-1`}>
              {children}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Rnd
      dragHandleClassName="modal-handle"
      default={{
        x: defaultX,
        y: defaultY,
        width: typeof width === "number" ? width : parseInt(width as string) || 320,
        height: height || "auto",
      }}
      disableDragging={disableDragging}
      enableResizing={enableResizing}
      minWidth={280}
      bounds="window"
      className={`z-50 ${className}`}

    >
      <div
        className={`font-sans bg-cardBg backdrop-blur-xs saturate-80 rounded-3xl border border-border shadow-2xl  overflow-hidden h-full flex flex-col`}
      >
        {/* Header */}
        <div className="font-display modal-handle flex justify-between items-center cursor-move px-6 py-4 text-text hover:bg-white/10 transition-colors border-b border-border">
          <h2 className="text-md font-medium tracking-wide uppercase">{title}</h2>
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
          className={`flex flex-col gap-6 overflow-y-auto ${maxHeight} py-4 px-6 flex-1`}
        >
          {children}
        </div>
      </div>
    </Rnd>
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