"use client";

import { motion } from "framer-motion";
import { IoPeopleOutline } from "react-icons/io5";
import { useRoomStore } from "@/store/useRoom";
import { Button } from "./Button";

interface RoomStatusButtonProps {
  onRoomModalOpen: () => void;
}

export default function RoomStatusButton({ onRoomModalOpen }: RoomStatusButtonProps) {
  const { roomCode, isHost, roomName } = useRoomStore();

  // Show button if user is host with a room OR user has joined a room
  const shouldShowButton = (isHost && roomCode) || (!isHost && roomCode);

  if (!shouldShowButton) return null;

  return (
    <Button
      onClick={onRoomModalOpen}
      className={`px-4 py-2 rounded-full text-sm font-body transition-colors flex items-center gap-2 ${
        roomCode 
          ? 'bg-primary/20 text-primary hover:bg-primary/30' 
          : 'text-foreground hover:bg-white/10'
      }`}
      variant="glassPlain"
    >
      <IoPeopleOutline className="w-4 h-4" />
      {roomCode ? `Room: ${roomName || roomCode}` : 'Study Together'}
      
      {/* Add indicator for room activity */}
      {roomCode && (
        <motion.div
          className="w-2 h-2 bg-green-400 rounded-full"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [1, 0.7, 1]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
    </Button>
  );
}