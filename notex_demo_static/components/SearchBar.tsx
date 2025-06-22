"use client";
import React, { useState } from "react";
import useSearch from "../hooks/useSearch";
import { Note } from "@/src/lib/demoNotes";   // adjust the path if your folder differs

const SearchBar: React.FC = () => {
  const [query, setQuery] = useState("");
  const { results, loading, searchNotes } = useSearch();

  return (
    <div>
      <input
        type="text"
        placeholder="Search for a note..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button onClick={() => searchNotes(query)}>Search</button>

      {loading && <p>Loading...</p>}

      {results.length > 0 && (
        <ul>
          {results.map((note: Note) => (
            <li key={note.id}>{note.title}</li>   {/* use note.id instead of note.note_id */}
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;
