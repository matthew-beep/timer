"use client";

import { motion } from "framer-motion";
import { IoWifiOutline, IoRefreshOutline, IoWarning } from "react-icons/io5";

interface ConnectionStatusProps {
  status: 'connecting' | 'connected' | 'disconnected' | 'error';
  className?: string;
}

export default function ConnectionStatus({ status, className = "" }: ConnectionStatusProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return { 
          icon: IoWifiOutline, 
          color: 'text-green-400', 
          bgColor: 'bg-green-400/20',
          text: 'Connected',
          pulse: false
        };
      case 'connecting':
        return { 
          icon: IoRefreshOutline, 
          color: 'text-yellow-400', 
          bgColor: 'bg-yellow-400/20',
          text: 'Connecting...',
          pulse: true
        };
      case 'error':
        return { 
          icon: IoWarning, 
          color: 'text-red-400', 
          bgColor: 'bg-red-400/20',
          text: 'Connection Error',
          pulse: true
        };
      default:
        return { 
          icon: IoWifiOutline, 
          color: 'text-text/50', 
          bgColor: 'bg-text/20',
          text: 'Disconnected',
          pulse: false
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <motion.div
      className={`flex items-center gap-2 text-xs ${config.color} ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className={`p-1 rounded-full ${config.bgColor}`}>
        <Icon 
          className={`w-3 h-3 ${config.pulse ? 'animate-spin' : ''}`} 
        />
      </div>
      <span>{config.text}</span>
    </motion.div>
  );
}