import React from 'react';
import { useTagsStore } from '@/store/useTags';

interface TagPillProps {
  tagId: string;
  name: string;
  onRemove?: () => void;
  className?: string;
  color: string;
}

export const TagPill: React.FC<TagPillProps> = ({ tagId, onRemove, name, className = "", color }) => {
  // Look up the metadata from the global store

  return (
    <div
      style={{ 
        backgroundColor: `${color}20`, // 20 adds 12% opacity for a soft background
        color: color,
        borderColor: `${color}40`
      }}
      className={`
        items-center gap-1.5 px-2 py-0.5 
        rounded-full border text-[11px] font-medium 
        transition-all hover:brightness-95 select-none border-red-600
        ${className}
      `}
    >
      <span className="truncate max-w-[100px]">{name}</span>
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation(); // Don't trigger note click events
            onRemove();
          }}
          className="hover:bg-black/10 rounded-full p-0.5 transition-colors"
        >
          X
        </button>
      )}
    </div>
  );
};