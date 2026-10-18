// This file gets movie and series data from the TMDB API (The Movie Database).
// It has functions to search, get lists (top rated, now playing...) and get details.

// One movie or series, as TMDB sends it.
// Movies use `title` and `release_date`, series use `name` and `first_air_date`.
// The "?" means the field can be missing.
export type TmdbMediaResult = {
  id: number;
  media_type: "movie" | "tv";
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  poster_path: string | null;
  backdrop_path?: string | null;
  overview: string;
  original_language?: string;
  popularity?: number;
  vote_average?: number;
  vote_count?: number;
};

// Same as above, plus more info we get on the details page.
export type TmdbMediaDetails = TmdbMediaResult & {
  genres?: { id: number; name: string }[];
  runtime?: number | null;
  number_of_seasons?: number;
  number_of_episodes?: number;
  status?: string;
  tagline?: string;
};

// What TMDB sends back for a search or a list.
type TmdbListResponse = {
  results: TmdbMediaResult[];
};

// Calls the TMDB API and returns the answer.
// `path` is the end of the link, for example "/movie/top_rated?page=1".
// `signal` lets us cancel the request (for example if the user types something new).
async function tmdbFetch(path: string, signal?: AbortSignal) {
  // Get the API key from the .env file
  const apiKey = process.env.EXPO_PUBLIC_TMDB_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("Missing EXPO_PUBLIC_TMDB_API_KEY");
  }

  // The path can already have "?" in it, so we add the key with "&" in that case
  const separator = path.includes("?") ? "&" : "?";
  const response = await fetch(
    `https://api.themoviedb.org/3${path}${separator}api_key=${apiKey}&language=en-US`,
    { signal },
  );

  // If the request failed, show the error message from TMDB (or a default one)
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(
      errorData?.status_message ?? `TMDB request failed (${response.status})`,
    );
  }

  return response.json();
}

// Searches movies and series by text (for example "batman").
export async function searchTmdb(query: string, signal?: AbortSignal) {
  // encodeURIComponent makes the text safe to put in a link.
  const data: TmdbListResponse = await tmdbFetch(
    `/search/multi?query=${encodeURIComponent(query)}&include_adult=false`,
    signal,
  );

  // The search also returns people (actors...), so we keep only movies and series
  return data.results.filter(
    (result) => result.media_type === "movie" || result.media_type === "tv",
  );
}

// Gets a list of movies or series.
// Movies: "top_rated" (best movies) or "now_playing" (in cinemas now).
// Series: "top_rated" (best series) or "on_the_air" (airing now).
export async function getTmdbList(
  mediaType: TmdbMediaResult["media_type"],
  list: "top_rated" | "now_playing" | "on_the_air",
  signal?: AbortSignal,
): Promise<TmdbMediaResult[]> {
  const data: TmdbListResponse = await tmdbFetch(
    `/${mediaType}/${list}?page=1`,
    signal,
  );
  // These results don't have media_type, so we add it to each one
  return data.results.map((result) => ({ ...result, media_type: mediaType }));
}

// Gets all the details of one movie or series (genres, runtime, seasons...).
// Used on the details page.
export async function getTmdbDetails(
  mediaType: TmdbMediaResult["media_type"],
  id: number,
  signal?: AbortSignal,
): Promise<TmdbMediaDetails> {
  return tmdbFetch(`/${mediaType}/${id}`, signal);
}

// Builds the full link of an image from its path.
// `size` is the width (for example "w185" or "w500").
// Returns null if there is no image.
export function getTmdbImageUrl(path: string | null, size = "w185") {
  return path ? `https://image.tmdb.org/t/p/${size}${path}` : null;
}

// Makes a small, clean copy of a movie/series before saving it in the database.
// Firestore does not accept "undefined" values, so we give a default value
// to each field, and we only keep the fields the app needs.
export function toSavedMedia(media: TmdbMediaResult): TmdbMediaResult {
  return {
    id: media.id,
    media_type: media.media_type,
    title: media.title ?? media.name ?? "Untitled",
    release_date: media.release_date ?? media.first_air_date ?? "",
    poster_path: media.poster_path ?? null,
    overview: media.overview ?? "",
  };
}

// A movie and a series can have the same id, so we add the type in front.
// Example: "movie-123" or "tv-456". Two titles with the same key are the same title.
export const getMediaKey = (media: TmdbMediaResult) =>
  `${media.media_type}-${media.id}`;
