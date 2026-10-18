// This file manages the favorite movies and series of a user.
// They are saved in the database in the document users/{uid}.

import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import type { TmdbMediaResult } from "./tmdb";

// Number of favorite slots (3 movies and 3 series).
export const FAVORITES_COUNT = 3;

// A list of favorites. Each slot has a movie/series, or null if the slot is empty.
export type Favorites = (TmdbMediaResult | null)[];

// The type of favorite: "movie" or "tv" (series).
export type FavoriteType = TmdbMediaResult["media_type"];

// Name of the field in the database for each type.
// Movies go in "favorites", series go in "favoriteSeries".
const FIELDS: Record<FavoriteType, string> = {
  movie: "favorites",
  tv: "favoriteSeries",
};

// Creates a list with 3 empty slots: [null, null, null]
export const emptyFavorites = (): Favorites =>
  Array(FAVORITES_COUNT).fill(null);

// Takes the list from the database and makes sure it always has 3 slots.
// Missing slots become null.
const toSlots = (stored: Favorites = []) =>
  emptyFavorites().map((_, index) => stored[index] ?? null);

// Listens to the user's favorites in the database.
// Each time they change, `onChange` is called with the new movies and series.
// It returns a function to stop listening (use it when the screen closes).
export function subscribeToFavorites(
  uid: string,
  onChange: (favorites: Record<FavoriteType, Favorites>) => void,
  onError: (error: Error) => void,
) {
  return onSnapshot(
    doc(db, "users", uid),
    (snapshot) => {
      const data = snapshot.data();
      onChange({
        movie: toSlots(data?.[FIELDS.movie]),
        tv: toSlots(data?.[FIELDS.tv]),
      });
    },
    onError,
  );
}

// Saves the favorites of one type (movies or series) in the database.
// `merge: true` means we only change this field and keep the rest of the user data.
export async function saveFavorites(
  uid: string,
  type: FavoriteType,
  favorites: Favorites,
) {
  await setDoc(
    doc(db, "users", uid),
    { [FIELDS[type]]: favorites },
    { merge: true },
  );
}
