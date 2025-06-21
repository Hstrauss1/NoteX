import { useState } from "react";

const useSearch = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchNotes = async (query: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/search_notes?title=${encodeURIComponent(query)}`);
      const data = await response.json();
      setResults(data.results || []);
    } catch (error) {
      console.error("Search failed:", error);
    }
    setLoading(false);
  };

  return { results, loading, searchNotes };
};

export default useSearch;
