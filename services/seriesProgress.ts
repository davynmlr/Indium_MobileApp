// This file manages where a user stopped watching each series (season + episode).
// It is saved in the database in the document users/{uid}, in the field "seriesProgress".
// It also finds the series that got a new season since the user last updated them.

import { deleteField, setDoc } from "firebase/firestore";
import { subscribeToUserDoc, userDocRef } from "./userDoc";
import { getTmdbDetails, TmdbMediaDetails, TmdbMediaResult } from "./tmdb";

export type SeriesProgress = {
  media: TmdbMediaResult; // small copy of the series (title, poster...)
  season: number; // last season watched
  episode: number; // last episode watched in that season
  // Newest season that was already out when the user saved.
  // If TMDB later shows a bigger number, a new season came out.
  latestSeason: number;
  // True if the user reached the last episode out when they saved.
  finished?: boolean;
  updatedAt: number; // when the user saved, in milliseconds
};

// mediaKey ("tv-123") -> progress of that series
export type SeriesProgressMap = Record<string, SeriesProgress>;

// A series with a new season the user has not seen yet.
export type NewSeason = {
  progress: SeriesProgress;
  newSeason: number; // number of the newest season out now
};

// Listens to the user's progress in the database.
// Each time it changes, `onChange` is called with the new data.
// It returns a function to stop listening (use it when the screen closes).
export function subscribeToSeriesProgress(
  uid: string,
  onChange: (progress: SeriesProgressMap) => void,
) {
  return subscribeToUserDoc(uid, (data) =>
    onChange(data?.seriesProgress ?? {}),
  );
}

// Saves the progress of one series.
// `merge: true` only changes this series and keeps the rest of the user data.
export async function saveSeriesProgress(
  uid: string,
  mediaKey: string,
  progress: SeriesProgress,
) {
  await setDoc(
    userDocRef(uid),
    { seriesProgress: { [mediaKey]: progress } },
    { merge: true },
  );
}

// Removes the progress of one series.
export async function removeSeriesProgress(uid: string, mediaKey: string) {
  await setDoc(
    userDocRef(uid),
    { seriesProgress: { [mediaKey]: deleteField() } },
    { merge: true },
  );
}

// Number of the newest season that already has at least one episode out.
export function getLatestAiredSeason(details: TmdbMediaDetails) {
  return details.last_episode_to_air?.season_number ?? 0;
}

// Seasons the user can pick: no "Specials" (season 0) and only seasons already out.
export function getAiredSeasons(details: TmdbMediaDetails) {
  const latest = getLatestAiredSeason(details);
  return (details.seasons ?? []).filter(
    (season) => season.season_number > 0 && season.season_number <= latest,
  );
}

// Checks every followed series on TMDB and returns the ones with a new season.
export async function getNewSeasons(
  progressMap: SeriesProgressMap,
  signal?: AbortSignal,
): Promise<NewSeason[]> {
  const results = await Promise.all(
    Object.values(progressMap).map(async (progress) => {
      try {
        const details = await getTmdbDetails("tv", progress.media.id, signal);
        const newSeason = getLatestAiredSeason(details);
        // New season = newer than what was out when the user saved,
        // and newer than the season the user is on.
        const isNew =
          newSeason > progress.latestSeason && newSeason > progress.season;
        return isNew ? { progress, newSeason } : null;
      } catch (error) {
        // If the request was cancelled, stop everything.
        if ((error as Error).name === "AbortError") throw error;
        return null; // one series failing should not hide the others
      }
    }),
  );
  return results.filter((result): result is NewSeason => result !== null);
}
