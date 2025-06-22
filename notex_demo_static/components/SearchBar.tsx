"use client";
import React, { useState } from "react";
import useSearch from "../hooks/useSearch";

const SearchBar = () => {
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
          {results.map((note) => (
            <li key={note.note_id}>{note.title}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;
