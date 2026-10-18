// Searches TMDB while the user types.
// Used in the Search screen and in the movie picker (Profile favorites).

import { useEffect, useState } from "react";
import { searchTmdb, TmdbMediaResult } from "../services/tmdb";

export function useTmdbSearch(query: string) {
  const [results, setResults] = useState<TmdbMediaResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setResults([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    // Wait 350 ms after the last key press before searching,
    // so we don't call the API for every letter.
    const timeout = setTimeout(async () => {
      setIsLoading(true);
      setError(null);

      try {
        setResults(await searchTmdb(trimmedQuery, controller.signal));
      } catch (requestError) {
        // AbortError means we cancelled the request on purpose: not a real error
        if ((requestError as Error).name !== "AbortError") {
          setResults([]);
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Could not load results.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }, 350);

    // When the text changes, cancel the old timer and the old request.
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [query]);

  return { results, isLoading, error };
}
