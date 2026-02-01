"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoCopyOutline, IoCheckmark, IoPeople, IoRibbon, IoLogOutOutline } from "react-icons/io5";
import { useRoomStore } from "@/store/useRoom";
import { Button } from "./Button";
import Modal from "@/components/Modal";

// Simple Tabs Component
function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
    return (
        <button
            onClick={onClick}
            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${active
                ? "bg-white/10 text-white shadow-sm"
                : "text-text/50 hover:text-text hover:bg-white/5"
                }`}
        >
            {children}
        </button>
    );
}

interface RoomModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function RoomModal({ isOpen, onClose }: RoomModalProps) {
    const { roomCode, isHost, members, createRoom, joinRoom, leaveRoom } = useRoomStore();
    const [joinCode, setJoinCode] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [hostName, setHostName] = useState('');
    const [createdCode, setCreatedCode] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [isJoining, setIsJoining] = useState(false);
    const [joinError, setJoinError] = useState('');
    const [activeTab, setActiveTab] = useState<'join' | 'create'>('join');

    const handleCreate = async () => {
        const code = await createRoom();
        setCreatedCode(code);
    };

    const handleJoin = async () => {
        if (joinCode.length !== 6) {
            setJoinError('Room code must be 6 characters');
            return;
        }

        setIsJoining(true);
        setJoinError('');

        try {
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

    const handleClose = () => {
        onClose();
    };

    // If already in a room, show room status
    if (roomCode) {
        return (
            <Modal isOpen={isOpen} onClose={onClose} title="Study Room" centered={true} width={400}>
                {/* Room Code Display */}
                <div className="bg-white/5 rounded-xl p-4 mb-6 border border-white/5">
                    <p className="text-sm text-text/50 mb-2">Room Code</p>
                    <div className="flex items-center gap-3">
                        <span className="font-mono text-3xl tracking-widest text-primary font-bold">
                            {roomCode}
                        </span>
                        <button
                            onClick={handleCopyCode}
                            className="p-2 rounded-lg bg-primary/20 hover:bg-primary/30 transition-colors"
                        >
                            {copied ? (
                                <IoCheckmark className="w-4 h-4 text-primary" />
                            ) : (
                                <IoCopyOutline className="w-4 h-4 text-primary" />
                            )}
                        </button>
                    </div>
                    {isHost && (
                        <p className="text-xs text-primary mt-2 flex items-center gap-1">
                            <IoRibbon className="w-3 h-3" /> You are the host
                        </p>
                    )}
                </div>

                {/* Members List */}
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                        <IoPeople className="w-4 h-4 text-text/50" />
                        <span className="text-sm text-text/50">
                            {members.length} {members.length === 1 ? 'member' : 'members'}
                        </span>
                    </div>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                        {members.map((member, index) => (
                            <div
                                key={index}
                                className={`flex items-center gap-3 p-3 rounded-lg ${index === 0 ? "bg-primary/10" : "bg-white/5"
                                    }`}
                            >
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/50 to-primary flex items-center justify-center text-white text-sm font-medium">
                                    {member[0]?.toUpperCase()}
                                </div>
                                <span className="text-white font-body">{member}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Leave Button */}
                <Button
                    onClick={handleLeave}
                    variant="plain"
                    className="w-full gap-2 border border-white/10 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20"
                >
                    <IoLogOutOutline className="w-4 h-4" />
                    Leave Room
                </Button>
            </Modal>
        );
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Study Together" centered={true} width={400}>
            {createdCode ? (
                // Show created room code
                <div className="text-center">
                    <p className="text-text/70 mb-4 font-body">
                        Share this code with your study buddies
                    </p>
                    <div className="bg-white/5 rounded-xl p-6 mb-6 border border-white/5">
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
                    <div className="bg-white/5 p-1 rounded-lg flex mb-6">
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
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 outline-none focus:border-white/30 transition-colors text-white placeholder:text-text/30 font-mono text-center text-xl tracking-widest uppercase"
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
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 outline-none focus:border-white/30 transition-colors text-white placeholder:text-text/30"
                                />
                            </div>
                            {joinError && (
                                <p className="text-sm text-red-400">{joinError}</p>
                            )}
                            <Button
                                onClick={handleJoin}
                                className="w-full justify-center"
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
                                {/* 
                            Note: We don't really use this host name in the current 'createRoom' yet. 
                            We should update useRoom to accept it.
                        */}
                                <label htmlFor="hostName" className="text-sm font-medium text-text/70">Your Name</label>
                                <input
                                    id="hostName"
                                    value={hostName}
                                    onChange={(e) => setHostName(e.target.value)}
                                    placeholder="Enter your display name"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 outline-none focus:border-white/30 transition-colors text-white placeholder:text-text/30"
                                />
                            </div>
                            <p className="text-sm text-text/50 font-body">
                                Create a room and share the code with friends to study together.
                            </p>
                            <Button onClick={handleCreate} disabled={!hostName} variant="glass" className="w-full justify-center">
                                Create Room
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </Modal>
    );
}
