import { demoNotes } from "@/lib/demoData";
import NoteLink from "@/components/ui/note-link";
import SearchBar from "@/components/SearchBar";

export default function HomePage() {
  return (
    <div className="p-4 flex flex-col gap-6 max-w-2xl mx-auto">
      <SearchBar />   {/* works off demoNotes via useSearch */}
      <div className="grid gap-4">
        {demoNotes.map((note) => (
          <NoteLink key={note.id} note={note} />
        ))}
      </div>
    </div>
  );
}
