'use client'
import { motion, AnimatePresence } from 'motion/react';
import { useTimer } from '@/store/useTimer';
import { useNotesStore } from '@/store/useNotes';
import { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { IoSettingsOutline, IoAddOutline } from 'react-icons/io5';
import { Button } from '@/components/Button';
import { LuLayoutGrid, LuList } from "react-icons/lu";
import { useThemeStore } from '@/store/useTheme';
import { PetRenderer } from './Pet';
import { usePetStore } from "@/store/usePetStore";
import { useTagsStore } from "@/store/useTags";

import TimerToolbar from './TimerToolbar';

export default function ProgressBar() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const timeRemaining = useTimer((s) => s.timeRemaining);
  const duration = useTimer((s) => s.duration);
  const progress = 1 - timeRemaining / duration;
  const timerActive = useTimer((s) => s.isRunning);
  const updateViewMode = useNotesStore((s) => s.updateViewMode);
  const mode = useTimer((s) => s.mode);
  const viewMode = useNotesStore((s) => s.viewMode);
  const gridTagFilterIds = useNotesStore((s) => s.gridTagFilterIds);
  const toggleGridTagFilter = useNotesStore((s) => s.toggleGridTagFilter);
  const setGridTagFilter = useNotesStore((s) => s.setGridTagFilter);
  const tags = useTagsStore((s) => s.tags);
  const [showText, setShowText] = useState(false);
  const [showGridTagPopover, setShowGridTagPopover] = useState(false);
  const gridTagPopoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleGridToggleMouseEnter = () => {
    if (gridTagPopoverTimeout.current) {
      clearTimeout(gridTagPopoverTimeout.current);
      gridTagPopoverTimeout.current = null;
    }
    setShowGridTagPopover(true);
  };

  const handleGridToggleMouseLeave = () => {
    gridTagPopoverTimeout.current = setTimeout(() => setShowGridTagPopover(false), 150);
  };

  const theme = useThemeStore((s) => s.theme);
  const addNewNote = useNotesStore((s) => s.addNewNote);
  const activePets = usePetStore((s) => s.activePets);
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const updateWidth = () => setContainerWidth(el.clientWidth);
    updateWidth();
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width;
      if (width != null) setContainerWidth(width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const addSticky = () => addNewNote(theme);

  return (
    <div className="w-screen fixed bottom-0 left-0 h-auto flex flex-col pointer-events-none z-50">

      {/* 2. UI LAYER: Reactivates pointer events for buttons/bar */}
      <div className="flex flex-col pointer-events-auto">

        {/* Toolbar Row */}
        <div className="flex justify-between items-end px-5">
          <div className='bg-[#0a1929]/60 border-white/10 mb-1 rounded-md shadow-md backdrop-blur-xl text-xs w-40 text-center p-1'>
            Spotify coming soon
          </div>
          {/* 1. PET LAYER: Transparent, no overflow hidden, allows pets to be tall */}
          <div
            ref={containerRef}
            className="w-full h-16 relative"
          >
            <AnimatePresence>
              {containerWidth > 0 &&
                activePets.map((petId) => (
                  <PetRenderer
                    key={petId}
                    id={petId}
                    containerWidth={containerWidth}
                  />
                ))}
            </AnimatePresence>
          </div>
          <div className='flex items-center h-10 gap-2 mb-1'>
            <div className="relative">
              <div className="relative bg-cardBg/60 p-1 rounded-full backdrop-blur-md border border-white/10 flex items-center h-10 w-24">
                <div className="absolute inset-0 p-1 flex">
                  <motion.div
                    className="h-full w-1/2 bg-active/20 border border-active/30 rounded-full"
                    animate={{ x: viewMode === 'grid' ? 0 : '100%' }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                </div>
                <button
                  onClick={() => updateViewMode("grid")}
                  onMouseEnter={handleGridToggleMouseEnter}
                  onMouseLeave={handleGridToggleMouseLeave}
                  className={`relative flex-1 flex justify-center items-center h-full z-10 ${viewMode === 'grid' ? 'text-active' : 'text-text/50'}`}
                >
                  <LuLayoutGrid size={18} />
                </button>
                <button
                  onClick={() => updateViewMode("list")}
                  className={`relative flex-1 flex justify-center items-center h-full z-10 ${viewMode === 'list' ? 'text-active' : 'text-text/50'}`}
                >
                  <LuList size={18} />
                </button>
              </div>

              <AnimatePresence>
                {showGridTagPopover && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute bottom-full font-sans left-0 mb-1 p-2 rounded-lg bg-cardBg/90 backdrop-blur-md border border-white/10 shadow-lg min-w-[160px] max-w-[220px]"
                    onMouseEnter={handleGridToggleMouseEnter}
                    onMouseLeave={handleGridToggleMouseLeave}
                  >
                    <p className="text-xs text-text/70 mb-2 px-1">Show on grid</p>
                    {tags.length === 0 ? (
                      <p className="text-xs text-text/50 italic">No tags yet</p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {tags.map((tag) => {
                          const selected = gridTagFilterIds.includes(tag.id);
                          return (
                            <button
                              key={tag.id}
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                toggleGridTagFilter(tag.id);
                              }}
                              className={`rounded-full px-2.5 py-1 text-xs font-medium border transition-colors ${selected ? 'ring-1 ring-offset-1 ring-offset-cardBg' : 'border-transparent'}`}
                              style={{
                                backgroundColor: selected ? `${tag.color}25` : `${tag.color}12`,
                                color: tag.color,
                                borderColor: selected ? `${tag.color}50` : 'transparent',
                              }}
                            >
                              {tag.name}
                            </button>
                          );
                        })}
                      </div>
                    )}
                    {gridTagFilterIds.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setGridTagFilter([])}
                        className="text-[10px] text-active mt-2 px-1 hover:underline"
                      >
                        Show all notes
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Button
              className="flex items-center justify-center p-2 rounded-full aspect-square h-full"
              onClick={addSticky}
              variant='glassPlain'
            >
              <IoAddOutline size={18} strokeWidth={0.5} />
            </Button>
          </div>
        </div>

        {/* 3. PROGRESS BAR: This is where overflow is hidden to clip the bar growth */}
        <div
          className="w-full h-2 hover:h-5 transition-all duration-300 bg-gray-500 relative overflow-hidden cursor-pointer"
          onMouseEnter={() => setShowText(true)}
          onMouseLeave={() => setShowText(false)}
        >
          <motion.div
            className="h-full bg-active/80 origin-left absolute left-0 w-full bottom-0"
            animate={{ scaleX: progress }}
            initial={{ scaleX: 0 }}
            transition={{ ease: "linear", duration: 0.1 }}
          />

          <AnimatePresence>
            {showText && (
              <motion.div
                className="absolute inset-0 flex justify-center items-center text-white text-xs font-sans pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {timerActive ?
                  <span>{mode === 'focus' ? 'Pomodoro' : 'Break'} {Math.floor(progress * 100)}% complete</span> :
                  <span>Timer Stopped</span>
                }
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}