import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import {
  getNewSeasons,
  NewSeason,
  SeriesProgressMap,
  subscribeToSeriesProgress,
} from "../services/seriesProgress";

// Returns the series of the logged-in user that got a new season.
// Empty list if nobody is logged in, or if `enabled` is false.
export function useNewSeasons(enabled = true) {
  const { user } = useAuth();
  const [progress, setProgress] = useState<SeriesProgressMap>({});
  const [newSeasons, setNewSeasons] = useState<NewSeason[]>([]);

  const uid = enabled ? user?.uid : undefined;

  useEffect(() => {
    if (!uid) {
      setProgress({});
      return;
    }
    // The user document also holds the watchlist and favorites. Keep the old
    // object when only those changed, so we don't ask TMDB again for nothing.
    return subscribeToSeriesProgress(uid, (next) =>
      setProgress((previous) =>
        JSON.stringify(previous) === JSON.stringify(next) ? previous : next,
      ),
    );
  }, [uid]);

  // Each time the progress changes, check TMDB again.
  useEffect(() => {
    if (Object.keys(progress).length === 0) {
      setNewSeasons([]);
      return;
    }
    const controller = new AbortController();
    getNewSeasons(progress, controller.signal)
      .then(setNewSeasons)
      .catch(() => {});
    return () => controller.abort();
  }, [progress]);

  return newSeasons;
}
