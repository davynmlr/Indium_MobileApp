// This file manages the watchlist of a user.
// It is saved in the database in the document users/{uid}, in the field "watchlist".

import { setDoc } from "firebase/firestore";
import { subscribeToUserDoc, userDocRef } from "./userDoc";
import { getMediaKey, TmdbMediaResult } from "./tmdb";

// Listens to the user's watchlist in the database.
// Each time it changes, `onChange` is called with the new list.
// It returns a function to stop listening (use it when the screen closes).
export function subscribeToWatchlist(
  uid: string,
  onChange: (watchlist: TmdbMediaResult[]) => void,
) {
  return subscribeToUserDoc(uid, (data) => onChange(data?.watchlist ?? []));
}

// Saves the whole watchlist in the database.
// `merge: true` means we only change this field and keep the rest of the user data.
export async function saveWatchlist(uid: string, watchlist: TmdbMediaResult[]) {
  await setDoc(userDocRef(uid), { watchlist }, { merge: true });
}

// Returns true if this movie/series is in the watchlist.
export function isInWatchlist(
  watchlist: TmdbMediaResult[],
  media: TmdbMediaResult,
) {
  return watchlist.some((item) => getMediaKey(item) === getMediaKey(media));
}

// Returns the watchlist without this movie/series.
export function removeFromWatchlist(
  watchlist: TmdbMediaResult[],
  media: TmdbMediaResult,
) {
  return watchlist.filter((item) => getMediaKey(item) !== getMediaKey(media));
}
