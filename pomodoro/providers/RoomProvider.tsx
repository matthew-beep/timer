'use client';

import { useEffect, useRef } from 'react';
import { useRoomStore } from '@/store/useRoom';

export default function RoomProvider({ children }: { children: React.ReactNode }) {
    const restoreSession = useRoomStore((s) => s.restoreSession);
    const initialized = useRef(false);

    useEffect(() => {
        if (!initialized.current) {
            initialized.current = true;
            restoreSession();
        }
    }, [restoreSession]);

    return <>{children}</>;
}
