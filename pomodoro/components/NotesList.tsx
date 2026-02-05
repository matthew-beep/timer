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
  const deleteTag = useTagsStore((s) => s.deleteTag);
  const [searchQuery, setSearchQuery] = useState("");
  const [newTagName, setNewTagName] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);  
  const [addTagSection, setAddTagSection] = useState(false);
  const [tagToDelete, setTagToDelete] = useState<{ id: string; name: string; color: string } | null>(null);

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

  const handleCreateTag = async (newTagName: string) => {
    if (!newTagName.trim()) return;
    try {
      // Assuming createTag returns the new tag or its ID
      await useTagsStore.getState().createTag(newTagName.trim());
      
      // Optional: auto-select the tag you just created
      //if (newTag?.id) setSelectedTagIds(prev => [...prev, newTag.id]);
      
      setNewTagName('');
      setAddTagSection(false);
    } catch (error) {
      console.error("Error creating tag:", error);
    }
  };

  return (
    <>
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
                
                <div className='flex items-start justify-start gap-2 px-1 h-12 min-h-[40px]'> {/* Added fixed height to prevent vertical jump */}
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
                  <div className="flex-1 overflow-x-auto no-scrollbar flex h-full">
                    <motion.div 
                      layout 
                      className="flex items-start gap-2"
                    >
                      <AnimatePresence mode="popLayout">
                        {/* INLINE ADD TAG INPUT */}
                        {addTagSection && (
                          <motion.div 
                            key="add-tag-input"
                            initial={{ opacity: 0, width: 0, scale: 0.9 }}
                            animate={{ opacity: 1, width: 'auto', scale: 1 }}
                            exit={{ opacity: 0, width: 0, scale: 0.9 }}
                            style={{
                              backgroundColor: `var(--color-active)15`, // Matches TagPill ~8% opacity
                              color: 'var(--color-active)',
                              borderColor: `var(--color-active)30` // Matches TagPill ~20% opacity
                            }}
                            className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-xs font-semibold tracking-wide shrink-0 overflow-hidden shadow-sm"
                          >
                            <input
                              autoFocus
                              type='text'
                              value={newTagName}
                              placeholder='New Tag'
                              className="bg-transparent text-xs outline-none w-16 text-active placeholder:text-active/50 font-semibold tracking-wide"
                              onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleCreateTag(newTagName);
                                  if (e.key === 'Escape') setAddTagSection(false);
                              }}
                              onChange={(e) => setNewTagName(e.target.value)}
                            />
                            
                            <button 
                              onClick={() => handleCreateTag(newTagName)}
                              className="flex items-center justify-center hover:bg-active/20 rounded-full transition-colors p-0.5 -mr-1"
                            >
                              <IoAddOutline size={14} strokeWidth={4} />
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
                          .map((tag) => {
                            const isSelected = selectedTagIds.includes(tag.id);
                            return (
                              <motion.div
                                layout="position" // Prevents the 'scaling' jump by only animating position
                                key={tag.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ 
                                  opacity: 1, 
                                  scale: 1,
                                }}
                                onClick={() => toggleTag(tag.id)}
                                className={`cursor-pointer transition-opacity duration-200 active:scale-95 shrink-0 ${isSelected ? 'opacity-100' : 'opacity-50 hover:opacity-80'}`}
                              >
                                <TagPill
                                  tagId={tag.id}
                                  name={tag.name}
                                  color={tag.color}
                                  id={tag.id}
                                  onRemove={() => setTagToDelete(tag)}
                                />
                              </motion.div>
                            );
                          })}
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

      {/* Confirm delete tag modal */}
      <Modal
        title="Delete tag?"
        isOpen={!!tagToDelete}
        onClose={() => setTagToDelete(null)}
        centered
        width={320}
        enableResizing={false}
        disableDragging
      >
        <div className="space-y-4">
          <p className="text-sm text-text/80">
            Delete tag <span className="font-semibold">{tagToDelete?.name}</span>? This will remove it from all notes.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="plain" className="px-3 py-2 rounded-md" onClick={() => setTagToDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="glassPlain"
              className="px-3 py-2 rounded-md bg-red-500/20 text-red-200 hover:bg-red-500/30"
              onClick={async () => {
                if (!tagToDelete) return;
                await deleteTag(tagToDelete.id);
                setSelectedTagIds((prev) => prev.filter((id) => id !== tagToDelete.id));
                setTagToDelete(null);
              }}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}