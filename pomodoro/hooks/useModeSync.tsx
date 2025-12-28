// hooks/useModeSync.ts
'use client';
import { useEffect } from 'react';
import { useModeStore } from '@/store/useTheme';

export function useModeSync() {
  const mode = useModeStore((s) => s.mode);
  const colors = useModeStore((s) => s.colors);

  useEffect(() => {
    const root = document.documentElement;
    
    root.style.setProperty('--work-color', colors.work);
    root.style.setProperty('--break-color', colors.break);
    root.style.setProperty('--active-mode-color', 
      mode === 'work' ? colors.work : colors.break
    );
    
    root.classList.remove('work-mode', 'break-mode');
    root.classList.add(`${mode}-mode`);
  }, [mode, colors]);
}