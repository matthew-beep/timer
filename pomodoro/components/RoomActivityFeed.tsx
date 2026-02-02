"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { IoPersonAdd, IoTimer, IoPause, IoPlay, IoLogOutOutline } from "react-icons/io5";
import { useRoomStore } from "@/store/useRoom";
import { RoomService } from "@/lib/roomService";

interface Activity {
  id: string;
  memberName: string;
  type: 'joined' | 'left' | 'timer_started' | 'timer_paused' | 'timer_reset';
  timestamp: Date;
  data?: unknown;
}

export default function RoomActivityFeed() {
  const { roomCode, members } = useRoomStore();
  const [baseTime] = useState(() => Date.now());

  const activities: Activity[] = roomCode
    ? members
        .map((member: string, index: number) => ({
          id: `initial-${index}`,
          memberName: member,
          type: "joined" as const,
          timestamp: new Date(baseTime - index * 1000),
        }))
        .slice(-10)
    : [];



  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'joined':
        return <IoPersonAdd className="w-3 h-3 text-green-400" />;
      case 'left':
        return <IoLogOutOutline className="w-3 h-3 text-red-400" />;
      case 'timer_started':
        return <IoPlay className="w-3 h-3 text-blue-400" />;
      case 'timer_paused':
        return <IoPause className="w-3 h-3 text-yellow-400" />;
      case 'timer_reset':
        return <IoTimer className="w-3 h-3 text-purple-400" />;
      default:
        return <IoTimer className="w-3 h-3 text-text/50" />;
    }
  };

  const getActivityText = (activity: Activity) => {
    switch (activity.type) {
      case 'joined':
        return `${activity.memberName} joined`;
      case 'left':
        return `${activity.memberName} left`;
      case 'timer_started':
        return `${activity.memberName} started timer`;
      case 'timer_paused':
        return `${activity.memberName} paused timer`;
      case 'timer_reset':
        return `${activity.memberName} reset timer`;
      default:
        return `${activity.memberName} performed action`;
    }
  };

  if (!roomCode || activities.length === 0) {
    return (
      <div className="text-center text-text/30 text-sm py-4">
        No recent activity
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-32 overflow-y-auto">
      {activities.map((activity, index) => (
        <motion.div
          key={activity.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex items-center gap-2 text-xs text-text/60"
        >
          {getActivityIcon(activity.type)}
          <span className="flex-1">{getActivityText(activity)}</span>
          <span className="text-text/40">
            {RoomService.getRelativeTime(activity.timestamp)}
          </span>
        </motion.div>
      ))}
    </div>
  );
}