import { StickyNote, useNotesStore } from "@/store/useNotes";
import { useTagsStore } from "@/store/useTags";
import { TagPill } from "./TagPill";


export default function NoteTagSelector({ id }: { id: string }) {
  const note = useNotesStore((s) => s.notes.find((n) => n.id === id));

  const allTags = useTagsStore(s => s.tags);
  const addTagToNote = useTagsStore(s => s.addTagToNote);
  const removeTagFromNote = useTagsStore(s => s.removeTagFromNote);
  const getTagsForNote = useTagsStore(s => s.getTagsForNote);

  const noteTags = getTagsForNote(note?.tagIds || []);
  const isTagSelected = (tagId: string) => 
    note?.tagIds?.includes(tagId) || false;

  const handleToggle = (tagId: string) => {

    /*
    if (isTagSelected(tagId)) {
      removeTagFromNote(note.id, tagId); // Instant UI update!
    } else {
      addTagToNote(note.id, tagId); // Instant UI update!
    }*/
  };

  return (
    <div>
      {/* Display selected tags */}
      <div className="selected-tags">
        {noteTags.map(tag => (
          <TagPill key={tag.id} tagId={tag.id} name={tag.name} color={tag.color} />
        ))}
      </div>

      {/* Tag picker */}
      <div className="tag-picker">
        {allTags.map(tag => (
          <TagPill key={tag.id} tagId={tag.id} name={tag.name} color={tag.color} />
        ))}
      </div>
    </div>
  );
}