import { useState, useEffect } from "react";
import { tmdb, TMDBSearchResult } from "../services/tmdb";

export function useDebouncedSearch(query: string, delay = 400) {
  const [results, setResults] = useState<TMDBSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    if (query.trim().length === 0) {
      setResults([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    const timeout = setTimeout(async () => {
      try {
        const data = await tmdb.searchMulti(query, controller.signal);
        setResults(data);
        setError(null);
      } catch (err: any) {
        if (err.name !== "AbortError")
          setError("Something went wrong. Try again.");
      } finally {
        setLoading(false);
      }
    }, delay);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [query, delay]);

  return { results, loading, error };
}
