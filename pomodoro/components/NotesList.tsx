"use client";
import { motion, AnimatePresence } from 'framer-motion'
import { useNotesStore } from '@/store/useNotes';
import { useMemo, useState } from 'react';
import ListNote from '@/components/ListNote';
import Modal, { ModalSection, ModalDivider } from "@/components/Modal";
import { IoAddOutline, IoSearchOutline, IoPricetagOutline } from 'react-icons/io5';
import { Button } from "@/components/Button";
import { useTagsStore } from '@/store/useTags';
import { TagPill } from '@/components/TagPill';

export default function NotesList({ showList, setShowList }: { showList: boolean, setShowList: (mode: "grid" | "list") => void }) {
  const notes = useNotesStore((s) => s.notes);
  const tags = useTagsStore((s) => s.tags);

  const [searchQuery, setSearchQuery] = useState("");
  const [newTagName, setNewTagName] = useState("");
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);

  // Filter and Sort Logic
  const filteredNotes = useMemo(() => {
    let result = [...notes];

    // Filter by Tag
    if (selectedTagId) {
      result = result.filter(n => n.tagIds?.includes(selectedTagId));
    }

    // Filter by Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(n =>
        n.plainText?.toLowerCase().includes(q)
      );
    }

    // Sort by Date
    return result.sort((a, b) => {
      const dateA = a.lastEdited ? new Date(a.lastEdited).getTime() : 0;
      const dateB = b.lastEdited ? new Date(b.lastEdited).getTime() : 0;
      return dateB - dateA;
    });
  }, [notes, searchQuery, selectedTagId]);

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
    try {
      await useTagsStore.getState().createTag(newTagName.trim());
      setNewTagName('');
    } catch (error) {
      console.error("Error creating tag:", error);
    }
  };

  return (
    <AnimatePresence>
      {showList && (
        <motion.div
          initial={{ opacity: 0, x: -300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -300 }}
          transition={{ type: 'tween', duration: 0.3 }}
          className="absolute top-0 left-0 z-50 pointer-events-auto h-full"
        >
          <Modal
            title="Notes Library"
            isOpen={showList}
            onClose={() => setShowList("grid")}
            width={340}
            defaultX={20}
            defaultY={20}
            className='h-[85vh] p-0'
          >
            {/* SEARCH & FILTER SECTION */}
            <ModalSection className="gap-3">
              <div className="relative flex items-center">
                <IoSearchOutline className="absolute left-3 text-text/40" size={16} />
                <input
                  type="text"
                  placeholder="Search notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 w-full bg-text/5 py-2 outline-none text-sm text-text placeholder:text-text/30 rounded-xl border border-white/5 focus:border-active/30 transition-all"
                />
              </div>

              {/* TAG FILTER BAR */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[10px] uppercase tracking-widest text-text/40 font-bold">Filters</span>
                  {selectedTagId && (
                    <button
                      onClick={() => setSelectedTagId(null)}
                      className="text-[10px] text-active hover:underline"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="flex overflow-x-auto gap-2 no-scrollbar pb-1">
                  {tags.map((tag) => (
                    <div
                      key={tag.id}
                      onClick={() => setSelectedTagId(tag.id === selectedTagId ? null : tag.id)}
                      className={`cursor-pointer transition-transform active:scale-95 ${selectedTagId === tag.id ? 'ring-2 ring-active ring-offset-2 ring-offset-cardBg rounded-full' : 'opacity-70'}`}
                    >
                      <TagPill tagId={tag.id} name={tag.name} color={tag.color} />
                    </div>
                  ))}
                </div>
              </div>
            </ModalSection>

            <ModalDivider />

            {/* CREATE TAG SECTION */}
            <ModalSection className="gap-2">
              <div className="flex items-center gap-2 bg-text/5 rounded-xl px-2 border border-dashed border-white/10 focus-within:border-active/30 transition-all">
                <IoPricetagOutline className="text-text/30" size={14} />
                <input
                  type='text'
                  value={newTagName}
                  placeholder='New tag name...'
                  className="bg-transparent py-2 text-xs outline-none flex-1 text-text placeholder:text-text/30"
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateTag()}
                  onChange={(e) => setNewTagName(e.target.value)}
                />
                <Button
                  variant="plain"
                  className="p-1 text-active hover:bg-active/10 rounded-lg"
                  onClick={handleCreateTag}
                >
                  <IoAddOutline size={18} />
                </Button>
              </div>
            </ModalSection>

            {/* NOTES LIST */}
            <ModalSection className='flex-1 overflow-y-auto min-h-0 custom-scrollbar'>
              <div className="flex flex-col gap-3">
                {filteredNotes.length > 0 ? (
                  filteredNotes.map((note, index) => (
                    <ListNote key={note.id} {...note} index={index} />
                  ))
                ) : (
                  <div className="py-10 text-center text-text/20 text-xs italic">
                    No notes found
                  </div>
                )}
              </div>
            </ModalSection>

            {/* FOOTER ACTION */}
            <div className="p-4 mt-auto">
              <Button variant="glassPlain" className="flex h-10 justify-center items-center rounded-xl text-text w-full gap-2 border border-white/5 hover:bg-white/5">
                <IoAddOutline size={20} />
                <span className="text-sm font-medium">Create New Note</span>
              </Button>
            </div>
          </Modal>
        </motion.div>
      )}
    </AnimatePresence>
  );
}