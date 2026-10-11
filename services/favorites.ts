import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import type { TmdbMediaResult } from "./tmdb";

export const FAVORITES_COUNT = 3;

// One entry per slot, null when the slot is empty.
export type Favorites = (TmdbMediaResult | null)[];

export type FavoriteType = TmdbMediaResult["media_type"];

// Field of users/{uid} holding the favorites of each type.
const FIELDS: Record<FavoriteType, string> = {
  movie: "favorites",
  tv: "favoriteSeries",
};

export const emptyFavorites = (): Favorites =>
  Array(FAVORITES_COUNT).fill(null);

const toSlots = (stored: Favorites = []) =>
  emptyFavorites().map((_, index) => stored[index] ?? null);

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

// Firestore rejects undefined values, so only keep the fields the app needs.
export function toFavorite(result: TmdbMediaResult): TmdbMediaResult {
  return {
    id: result.id,
    media_type: result.media_type,
    title: result.title ?? result.name ?? "Untitled",
    release_date: result.release_date ?? result.first_air_date ?? "",
    poster_path: result.poster_path ?? null,
    overview: result.overview ?? "",
  };
}
