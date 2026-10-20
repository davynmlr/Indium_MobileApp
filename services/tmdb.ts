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

// One season of a series. Season 0 is often "Specials".
export type TmdbSeason = {
  season_number: number;
  episode_count: number;
  air_date: string | null; // null if the season is announced but not out yet
  name: string;
};

// One video (trailer, teaser...) of a movie or series.
// For YouTube videos, `key` is the id in the link: youtube.com/watch?v={key}
export type TmdbVideo = {
  key: string;
  site: string; // "YouTube", "Vimeo"...
  type: string; // "Trailer", "Teaser", "Clip"...
  name: string;
  official: boolean;
};

// Same as above, plus more info we get on the details page.
export type TmdbMediaDetails = TmdbMediaResult & {
  genres?: { id: number; name: string }[];
  runtime?: number | null;
  number_of_seasons?: number;
  number_of_episodes?: number;
  status?: string;
  tagline?: string;
  // Series only:
  seasons?: TmdbSeason[];
  // The newest episode that is already out (null if nothing aired yet).
  last_episode_to_air?: {
    season_number: number;
    episode_number: number;
    air_date: string;
  } | null;
  // Trailers and other videos (asked with append_to_response=videos).
  videos?: { results: TmdbVideo[] };
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

// Gets the movies and series that are the most popular this week on TMDB
// (most viewed and searched), most popular first.
export async function getTmdbTrending(signal?: AbortSignal) {
  const data: TmdbListResponse = await tmdbFetch(`/trending/all/week`, signal);
  // Trending can also contain people, so we keep only movies and series.
  return data.results.filter(
    (result) => result.media_type === "movie" || result.media_type === "tv",
  );
}

// Gets all the details of one movie or series (genres, runtime, seasons...).
// Used on the details page.
export async function getTmdbDetails(
  mediaType: TmdbMediaResult["media_type"],
  id: number,
  signal?: AbortSignal,
): Promise<TmdbMediaDetails> {
  // The videos come in the same request, so we don't need a second call.
  return tmdbFetch(
    `/${mediaType}/${id}?append_to_response=videos&include_video_language=en,null`,
    signal,
  );
}

// Genre names of each title, kept in memory so each title is asked only once.
const genresCache: Record<string, Promise<string[]>> = {};

// Gets the genre names of one movie or series (for example ["Action", "Drama"]).
export function getTmdbGenres(media: TmdbMediaResult): Promise<string[]> {
  const key = getMediaKey(media);
  if (!genresCache[key]) {
    genresCache[key] = tmdbFetch(`/${media.media_type}/${media.id}`)
      .then((details: TmdbMediaDetails) =>
        (details.genres ?? []).map((genre) => genre.name),
      )
      .catch((error) => {
        delete genresCache[key]; // try again next time
        throw error;
      });
  }
  return genresCache[key];
}

// Finds the best trailer on YouTube: an official trailer first,
// then any trailer, then a teaser. Returns null if there is none.
export function getTrailer(details: TmdbMediaDetails): TmdbVideo | null {
  const videos = (details.videos?.results ?? []).filter(
    (video) => video.site === "YouTube",
  );
  return (
    videos.find((v) => v.type === "Trailer" && v.official) ??
    videos.find((v) => v.type === "Trailer") ??
    videos.find((v) => v.type === "Teaser") ??
    null
  );
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

// The opposite of getMediaKey: turns a saved review or rating back into a
// movie/series, to open its details page.
// mediaKey looks like "movie-123", so we split it to get the type and the id.
export function mediaFromKey(saved: {
  mediaKey: string;
  title: string;
  poster_path: string | null;
}): TmdbMediaResult {
  const [mediaType, id] = saved.mediaKey.split("-");
  return {
    id: Number(id),
    media_type: mediaType as TmdbMediaResult["media_type"],
    title: saved.title,
    poster_path: saved.poster_path,
    overview: "",
  };
}
