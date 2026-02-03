"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  IoCopyOutline,
  IoCheckmark,
  IoPeople,
  IoRibbon,
  IoLogOutOutline,
  IoSettings,
  IoShieldCheckmark,
  IoPersonRemove
} from "react-icons/io5";
import { LuCrown } from "react-icons/lu";
import { useRoomStore } from "@/store/useRoom";
import { useTimer } from "@/store/useTimer";
import { RoomService } from "@/lib/roomService";
import { Button } from "./Button";
import Modal from "@/components/Modal";
import ConnectionStatus from "@/components/ConnectionStatus";
import RoomActivityFeed from "@/components/RoomActivityFeed";

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${active
        ? "bg-text/10 text-text shadow-sm"
        : "text-text/50 hover:text-text hover:bg-text/5"
        }`}
    >
      {children}
    </button>
  );
}



function RoomSettings({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { roomSettings, updateSettings, isHost } = useRoomStore();
  const [localSettings, setLocalSettings] = useState(roomSettings);

  const handleSave = () => {
    updateSettings(localSettings);
    onClose();
  };

  const handleCancel = () => {
    setLocalSettings(roomSettings);
    onClose();
  };

  if (!isHost) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleCancel} title="Room Settings" centered={true} width={400}>
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-text/70">Room Type</label>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isPrivate"
              checked={localSettings.isPrivate}
              onChange={(e) => {
                const isChecked = (e.target as HTMLInputElement).checked;
                setLocalSettings((prev) => ({ ...prev, isPrivate: isChecked }));
              }}
              className="w-4 h-4 rounded"
            />
            <label htmlFor="isPrivate" className="text-sm text-text">
              Private Room (requires password)
            </label>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-text/70">Maximum Members</label>
          <input
            type="number"
            min="2"
            max="20"
            value={localSettings.maxMembers}
            onChange={(e) => {
              const value = parseInt((e.target as HTMLInputElement).value) || 10;
              setLocalSettings((prev) => ({ ...prev, maxMembers: value }));
            }}
            className="w-full bg-text/5 border border-white/10 rounded-lg py-2 px-3 text-text"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-text/70">Guest Controls</label>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="allowGuestControl"
              checked={localSettings.allowGuestControl}
              onChange={(e) => {
                const isChecked = (e.target as HTMLInputElement).checked;
                setLocalSettings((prev) => ({ ...prev, allowGuestControl: isChecked }));
              }}
              className="w-4 h-4 rounded"
            />
            <label htmlFor="allowGuestControl" className="text-sm text-text">
              Allow non-hosts to control timer
            </label>
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button onClick={handleSave} variant="glass" className="flex-1">
            Save Settings
          </Button>
          <Button onClick={handleCancel} variant="plain" className="flex-1">
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
}

interface RoomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RoomModal({ isOpen, onClose }: RoomModalProps) {
  const {
    roomCode,
    roomName,
    userName, // 👈 Get userName
    isHost,
    members,
    connectionStatus,
    roomSettings,
    createRoom,
    joinRoom,
    leaveRoom,
    kickMember
  } = useRoomStore();

  const { mode, timeRemaining, duration, isRunning } = useTimer();
  const [joinCode, setJoinCode] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [hostName, setHostName] = useState('');
  const [createdCode, setCreatedCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState('');
  const [activeTab, setActiveTab] = useState<'join' | 'create'>('join');
  const [showSettings, setShowSettings] = useState(false);
  const [roomDisplayName, setRoomDisplayName] = useState(''); // <-- new state

  const handleCreate = async () => {
    try {
      const rateLimitCheck = RoomService.canCreateRoom();
      if (!rateLimitCheck.allowed) {
        setJoinError(rateLimitCheck.reason || 'Cannot create room right now');
        return;
      }

      RoomService.recordRoomCreation();

      const code = await createRoom(hostName || 'Host', roomDisplayName, RoomService.getDefaultSettings());
      setCreatedCode(code);
    } catch (error) {
      setJoinError('Failed to create room');
    }
  };

  const handleJoin = async () => {
    if (joinCode.length !== 6) {
      setJoinError('Room code must be 6 characters');
      return;
    }

    setIsJoining(true);
    setJoinError('');

    try {
      if (!RoomService.validateRoomCode(joinCode)) {
        setJoinError('Invalid room code format');
        return;
      }

      await joinRoom(joinCode, displayName);
      onClose();
    } catch (e) {
      setJoinError('Failed to join room');
    }

    setIsJoining(false);
  };

  const handleCopyCode = async () => {
    if (createdCode || roomCode) {
      await navigator.clipboard.writeText(createdCode || roomCode || '');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLeave = () => {
    leaveRoom();
    setCreatedCode(null);
    setJoinCode('');
    setDisplayName('');
    setHostName('');
    onClose();
  };

  const handleKickMember = (memberName: string) => {
    if (confirm(`Remove ${memberName} from the room?`)) {
      kickMember(memberName);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // If already in a room, show room status
  if (roomCode) {
    return (
      <>
        <Modal isOpen={isOpen} onClose={onClose} title={roomName || roomCode} centered={true} width={450}>
          {/* Connection Status */}
          <div className="flex items-center justify-between mb-4">
            <ConnectionStatus status={connectionStatus} />
            {isHost && (
              <Button
                onClick={() => setShowSettings(true)}
                variant="plain"
                className="p-2 text-text/70 hover:text-text"
              >
                <IoSettings className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Room Code Display */}
          <div className="bg-text/5 rounded-xl p-4 mb-6 border border-border/5 text-text">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-text/50">Room Code</p>
              {roomSettings.isPrivate && (
                <IoShieldCheckmark className="w-4 h-4 text-yellow-400" title="Private Room" />
              )}
            </div>
            <div className="flex items-center gap-3 ">
              <span className="font-mono text-3xl tracking-widest font-bold">
                {roomCode}
              </span>
              <button
                onClick={handleCopyCode}
                className="p-2 rounded-lg bg-text/20 hover:bg-primary/30 transition-colors"
              >
                {copied ? (
                  <IoCheckmark className="w-4 h-4" />
                ) : (
                  <IoCopyOutline className="w-4 h-4" />
                )}
              </button>
            </div>
            {isHost && (
              <p className="text-xs text-text/50 mt-2 flex items-center gap-1">
                <LuCrown className="w-3 h-3" color="#D4AF37" /> You are the host
              </p>
            )}
          </div>

          {/* Timer Status */}
          <div className="bg-text/5 rounded-xl p-4 mb-6 border border-border/5">
            <p className="text-sm text-text/50 mb-2">Timer Status</p>
            <div className="flex items-center justify-between text-text">
              <div>
                <p className="text-lg font-medium capitalize">{mode}</p>
                <p className="text-2xl font-bold">{formatTime(timeRemaining)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-text/50">{isRunning ? 'Running' : 'Paused'}</p>
                <p className="text-xs text-text/30">{formatTime(duration)} total</p>
              </div>
            </div>
          </div>

          {/* Members List */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <IoPeople className="w-4 h-4 text-text/50" />
                <span className="text-sm text-text/50">
                  {members.length}/{roomSettings.maxMembers} members
                </span>
              </div>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
              {members.map((member: string, index: number) => {
                const isMe = member === userName;
                return (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-lg ${isMe ? "bg-text/5 border border-border/30" : (index === 0 ? "bg-background/10" : "bg-background/5 border-border border")
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-text text-sm font-medium ${isMe ? "bg-primary" : "bg-gradient-to-br from-primary/50 to-primary"
                        }`}>
                        {member[0]?.toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className={`font-body ${isMe ? "text-text font-medium" : "text-text"}`}>
                          {member} {isMe && "(you)"}
                        </span>
                      </div>
                      {index === 0 && (
                        <LuCrown className="w-3 h-3 text-primary" color="#D4AF37" title="Host" />
                      )}
                    </div>
                    {isHost && index !== 0 && !isMe && (
                      <button
                        onClick={() => handleKickMember(member)}
                        className="p-1 rounded hover:bg-red-500/20 text-text/50 hover:text-red-400 transition-colors"
                      >
                        <IoPersonRemove className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Activity Feed */}
          <div className="flex flex-col gap-2 ">
            <p className="text-sm text-text/50">Recent Activity</p>
            <div className="bg-text/5 rounded-lg p-3 border border-border/5">
              <RoomActivityFeed />
            </div>
          </div>

          {/* Leave Button */}
          <Button
            onClick={handleLeave}
            variant="danger"
            className="w-full p-3 gap-2 border rounded-full flex items-center justify-center border-border/30"
          >
            <IoLogOutOutline className="w-4 h-4" />
            Leave Room
          </Button>
        </Modal>

        <RoomSettings isOpen={showSettings} onClose={() => setShowSettings(false)} />
      </>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Study Together" centered={true} width={400}>
      {createdCode ? (
        <div className="text-center">
          <p className="text-text/70 mb-4 font-body">
            Share this code with your study buddies
          </p>
          <div className="bg-text/5 rounded-xl p-6 mb-6 border border-white/5">
            <div className="flex items-center justify-center gap-3">
              <span className="font-mono text-4xl tracking-widest text-primary font-bold">
                {createdCode}
              </span>
              <button
                onClick={handleCopyCode}
                className="p-2 rounded-lg bg-primary/20 hover:bg-primary/30 transition-colors"
              >
                {copied ? (
                  <IoCheckmark className="w-5 h-5 text-primary" />
                ) : (
                  <IoCopyOutline className="w-5 h-5 text-primary" />
                )}
              </button>
            </div>
          </div>
          <Button onClick={onClose} variant="glass" className="w-full">
            Start Studying
          </Button>
        </div>
      ) : (
        <div className="w-full">
          <div className="bg-text/5 p-1 rounded-lg flex mb-6">
            <TabButton active={activeTab === 'join'} onClick={() => setActiveTab('join')}>
              Join Room
            </TabButton>
            <TabButton active={activeTab === 'create'} onClick={() => setActiveTab('create')}>
              Create Room
            </TabButton>
          </div>

          {activeTab === 'join' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-2">
                <label htmlFor="joinCode" className="text-sm font-medium text-text/70">Room Code</label>
                <input
                  id="joinCode"
                  value={joinCode}
                  onChange={(e) => {
                    setJoinCode(e.target.value.toUpperCase().slice(0, 6));
                    setJoinError('');
                  }}
                  placeholder="ABCD12"
                  className="w-full bg-text/5 border border-white/10 rounded-xl py-2 px-4 outline-none focus:border-white/30 transition-colors text-text placeholder:text-text/30 font-mono text-center text-xl tracking-widest uppercase"
                  maxLength={6}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="displayName" className="text-sm font-medium text-text/70">Your Name</label>
                <input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your display name"
                  className="w-full bg-text/5 border border-white/10 rounded-xl py-2 px-4 outline-none focus:border-white/30 transition-colors text-text placeholder:text-text/30"
                />
              </div>
              {joinError && (
                <p className="text-sm text-red-400">{joinError}</p>
              )}
              <Button
                onClick={handleJoin}
                className="w-full justify-center rounded-full p-2"
                variant="glass"
                disabled={isJoining || joinCode.length !== 6 || !displayName}
              >
                {isJoining ? 'Joining...' : 'Join Room'}
              </Button>
            </div>
          )}

          {activeTab === 'create' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
              <div className="space-y-2">
                <label htmlFor="hostName" className="text-sm font-medium text-text/70">Your Name</label>
                <input
                  id="hostName"
                  value={hostName}
                  onChange={(e) => setHostName(e.target.value)}
                  placeholder="Enter your display name"
                  className="w-full bg-text/5 border border-white/10 rounded-xl py-2 px-4 outline-none focus:border-white/30 transition-colors text-text placeholder:text-text/30"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-text/70">Room Name</label>
                <input
                  value={roomDisplayName}
                  onChange={(e) => setRoomDisplayName(e.target.value)}
                  placeholder="Late Night Pomodoro"
                  className="w-full bg-text/5 border border-white/10 rounded-xl py-2 px-4 text-text"
                />
              </div>
              <p className="text-sm text-text/50 font-body">
                Create a room and share the code with friends to study together.
              </p>
              {joinError && (
                <p className="text-sm text-red-400">{joinError}</p>
              )}
              <Button onClick={handleCreate} disabled={!hostName} variant="glass" className="w-full justify-center p-2 rounded-full">
                Create Room
              </Button>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}