"use client";
import { motion, AnimatePresence } from 'framer-motion'
import { useNotesStore } from '@/store/useNotes';
import { useMemo, useState } from 'react';
import ListNote from '@/components/ListNote';
import Modal, { ModalSection } from "@/components/Modal";
import { IoAddOutline, IoSearchOutline } from 'react-icons/io5';
import { Button } from "@/components/Button";
import { useTagsStore } from '@/store/useTags';
import { TagPill } from '@/components/TagPill';

export default function NotesList({ showList, setShowList }: { showList: boolean, setShowList: (mode: "grid" | "list") => void }) {
  const notes = useNotesStore((s) => s.notes);
  const tags = useTagsStore((s) => s.tags);

  const [searchQuery, setSearchQuery] = useState("");
  const [newTagName, setNewTagName] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);  
  const [addTagSection, setAddTagSection] = useState(false);

  const filteredNotes = useMemo(() => {
    let result = [...notes];

    if (selectedTagIds.length > 0) {
      result = result.filter(n => 
        selectedTagIds.every(id => n.tagIds?.includes(id))
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(n =>
        n.plainText?.toLowerCase().includes(q)
      );
    }

    return result.sort((a, b) => {
      const dateA = a.lastEdited ? new Date(a.lastEdited).getTime() : 0;
      const dateB = b.lastEdited ? new Date(b.lastEdited).getTime() : 0;
      return dateB - dateA;
    });
  }, [notes, searchQuery, selectedTagIds]);

  const toggleTag = (id: string) => {
    setSelectedTagIds(prev => 
      prev.includes(id) 
        ? prev.filter(t => t !== id) 
        : [...prev, id]
    );
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
    try {
      // Assuming createTag returns the new tag or its ID
      const newTag = await useTagsStore.getState().createTag(newTagName.trim());
      
      // Optional: auto-select the tag you just created
      if (newTag?.id) setSelectedTagIds(prev => [...prev, newTag.id]);
      
      setNewTagName('');
      setAddTagSection(false);
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
            <ModalSection className="gap-3">
              {/* SEARCH INPUT */}
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

            {/* TAG FILTER & CREATE BAR */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] uppercase tracking-widest text-text/40 font-bold">Filters</span>
                {selectedTagIds.length > 0 && (
                  <button
                    onClick={() => setSelectedTagIds([])}
                    className="text-[10px] text-active hover:underline"
                  >
                    Clear ({selectedTagIds.length})
                  </button>
                )}
              </div>
              
              <div className='flex items-center justify-start gap-2 px-1 h-8'> {/* Added fixed height to prevent vertical jump */}
                <Button 
                  onClick={() => setAddTagSection(!addTagSection)} 
                  className={`rounded-md w-6 h-6 flex items-center justify-center shrink-0 transition-colors ${addTagSection ? 'bg-active text-white' : ''}`}
                >
                  <IoAddOutline 
                    size={16} 
                    className={`transition-transform duration-200 ${addTagSection ? 'rotate-45' : ''}`} 
                  />
                </Button>
                
                {/* This container handles the horizontal scroll */}
                <div className="flex-1 overflow-x-auto no-scrollbar py-1 flex items-center h-full">
                  <motion.div 
                    layout 
                    className="flex items-center gap-2"
                  >
                    <AnimatePresence mode="popLayout">
                      {/* INLINE ADD TAG INPUT */}
                      {addTagSection && (
                        <motion.div 
                          key="add-tag-input"
                          initial={{ opacity: 0, width: 0, x: -10 }}
                          animate={{ opacity: 1, width: 'auto', x: 0 }}
                          exit={{ opacity: 0, width: 0, x: -10 }}
                          className="flex items-center gap-2 bg-active/10 rounded-full pl-3 pr-1 border border-active/30 shrink-0 overflow-hidden"
                        >
                          <input
                            autoFocus
                            type='text'
                            value={newTagName}
                            placeholder='Tag name...'
                            className="bg-transparent text-xs outline-none w-20 text-text placeholder:text-active/40"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleCreateTag();
                                if (e.key === 'Escape') setAddTagSection(false);
                            }}
                            onChange={(e) => setNewTagName(e.target.value)}
                          />
                          <button 
                            onClick={handleCreateTag}
                            className="w-5 h-5 rounded-full bg-active text-white flex items-center justify-center shrink-0"
                          >
                            <IoAddOutline size={14} />
                          </button>
                        </motion.div>
                      )}

                      {/* TAG PILLS */}
                      {[...tags]
                        .sort((a, b) => {
                          const aSelected = selectedTagIds.includes(a.id) ? 1 : 0;
                          const bSelected = selectedTagIds.includes(b.id) ? 1 : 0;
                          return bSelected - aSelected;
                        })
                        .map((tag) => (
                          <motion.div
                            layout
                            key={tag.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            onClick={() => toggleTag(tag.id)}
                            className={`cursor-pointer transition-all active:scale-95 shrink-0 ${
                              !selectedTagIds.includes(tag.id) && 'opacity-40 hover:opacity-100'
                            }`}
                          >
                            <TagPill tagId={tag.id} name={tag.name} color={tag.color} id={""}/>
                          </motion.div>
                        ))}
                    </AnimatePresence>
                  </motion.div>
                </div>
              </div>
            </div>
            </ModalSection>

            {/* NOTES LIST CONTENT */}
            <ModalSection className='flex-1 overflow-y-auto min-h-0 custom-scrollbar'>
              <div className="flex flex-col gap-3">
                {filteredNotes.length > 0 ? (
                  filteredNotes.map((note, index) => (
                    <ListNote key={note.id} {...note} index={index} />
                  ))
                ) : (
                  <div className="py-10 text-center text-text/20 text-xs italic">
                    No notes found matching these criteria
                  </div>
                )}
              </div>
            </ModalSection>

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