// lib/roomService.ts
// Simplified room service for realtime-only implementation

export interface RoomSettings {
  isPrivate: boolean;
  maxMembers: number;
  allowGuestControl: boolean;
}

export interface RoomActivity {
  id: string;
  memberName: string;
  activity: string;
  timestamp: Date;
  data?: any;
}

export const RoomService = {
  // Generate secure room code
  generateRoomCode(length: number = 6): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    return Array.from({ length }, () => 
      chars[Math.floor(Math.random() * chars.length)]
    ).join('');
  },

  // Validate room code format
  validateRoomCode(code: string): boolean {
    const validChars = /^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]+$/;
    return code.length === 6 && validChars.test(code);
  },

  // Client-side rate limiting for room creation
  canCreateRoom(): { allowed: boolean; reason?: string } {
    const storageKey = 'room_creation_history';
    const history = JSON.parse(localStorage.getItem(storageKey) || '[]');
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);
    
    // Clean old entries
    const recentHistory = history.filter((timestamp: number) => timestamp > oneHourAgo);
    
    if (recentHistory.length >= 3) {
      return { allowed: false, reason: 'Rate limit: Maximum 3 rooms per hour' };
    }
    
    return { allowed: true };
  },

  // Record room creation for rate limiting
  recordRoomCreation(): void {
    const storageKey = 'room_creation_history';
    const history = JSON.parse(localStorage.getItem(storageKey) || '[]');
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);
    
    // Clean old entries and add new one
    const recentHistory = history.filter((timestamp: number) => timestamp > oneHourAgo);
    recentHistory.push(now);
    
    localStorage.setItem(storageKey, JSON.stringify(recentHistory));
  },

  // Default room settings
  getDefaultSettings(): RoomSettings {
    return {
      isPrivate: false,
      maxMembers: 10,
      allowGuestControl: true,
    };
  },

  // Format time for display
  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  },

  // Get relative time string
  getRelativeTime(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const seconds = Math.floor(diff / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  },
};