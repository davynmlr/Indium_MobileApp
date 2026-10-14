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

// What TMDB sends back for a search.
type TmdbSearchResponse = {
  results: TmdbMediaResult[];
};

// What TMDB sends back for a movie or series list.
// These results don't have `media_type`, so we add it ourselves later.
type TmdbMovieListResponse = {
  results: Omit<TmdbMediaResult, "media_type">[];
};

type TmdbSeriesListResponse = {
  results: Omit<TmdbMediaResult, "media_type">[];
};

// Start of the link for poster images. "w185" is the image width.
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w185";

// Searches movies and series by text (for example "batman").
// `signal` lets us cancel the request if the user types something new.
export async function searchTmdb(query: string, signal?: AbortSignal) {
  // Get the API key from the .env file
  const apiKey = process.env.EXPO_PUBLIC_TMDB_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("Missing EXPO_PUBLIC_TMDB_API_KEY");
  }

  // Call the API. encodeURIComponent makes the text safe to put in a link.
  const response = await fetch(
    `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&query=${encodeURIComponent(
      query,
    )}&include_adult=false&language=en-US`,
    { signal },
  );

  // If the request failed, show the error message from TMDB (or a default one)
  if (!response.ok) {
    const errorData = (await response.json().catch(() => null)) as {
      status_message?: string;
    } | null;
    throw new Error(
      errorData?.status_message ?? `TMDB search failed (${response.status})`,
    );
  }

  const data = (await response.json()) as TmdbSearchResponse;

  // The search also returns people (actors...), so we keep only movies and series
  return data.results.filter(
    (result) => result.media_type === "movie" || result.media_type === "tv",
  );
}

// Gets a list of movies: "top_rated" (best movies) or "now_playing" (in cinemas now).
export async function getTmdbMovieList(
  list: "top_rated" | "now_playing",
  signal?: AbortSignal,
) {
  const apiKey = process.env.EXPO_PUBLIC_TMDB_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("Missing EXPO_PUBLIC_TMDB_API_KEY");
  }

  const response = await fetch(
    `https://api.themoviedb.org/3/movie/${list}?api_key=${apiKey}&language=en-US&page=1`,
    { signal },
  );

  if (!response.ok) {
    const errorData = (await response.json().catch(() => null)) as {
      status_message?: string;
    } | null;
    throw new Error(
      errorData?.status_message ?? `TMDB ${list} movies failed (${response.status})`,
    );
  }

  const data = (await response.json()) as TmdbMovieListResponse;
  // Add media_type: "movie" to each result, so the app knows it is a movie
  return data.results.map((result) => ({ ...result, media_type: "movie" as const }));
}

// Gets a list of series: "top_rated" (best series) or "on_the_air" (airing now).
export async function getTmdbSeriesList(
  list: "top_rated" | "on_the_air",
  signal?: AbortSignal,
) {
  const apiKey = process.env.EXPO_PUBLIC_TMDB_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("Missing EXPO_PUBLIC_TMDB_API_KEY");
  }

  const response = await fetch(
    `https://api.themoviedb.org/3/tv/${list}?api_key=${apiKey}&language=en-US&page=1`,
    { signal },
  );

  if (!response.ok) {
    const errorData = (await response.json().catch(() => null)) as {
      status_message?: string;
    } | null;
    throw new Error(
      errorData?.status_message ?? `TMDB ${list} series failed (${response.status})`,
    );
  }

  const data = (await response.json()) as TmdbSeriesListResponse;
  // Add media_type: "tv" to each result, so the app knows it is a series
  return data.results.map((result) => ({ ...result, media_type: "tv" as const }));
}

// Gets all the details of one movie or series (genres, runtime, seasons...).
// Used on the details page.
export async function getTmdbDetails(
  mediaType: TmdbMediaResult["media_type"],
  id: number,
  signal?: AbortSignal,
) {
  const apiKey = process.env.EXPO_PUBLIC_TMDB_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("Missing EXPO_PUBLIC_TMDB_API_KEY");
  }

  // The link is different for movies ("movie") and series ("tv")
  const response = await fetch(
    `https://api.themoviedb.org/3/${mediaType === "movie" ? "movie" : "tv"}/${id}?api_key=${apiKey}&language=en-US`,
    { signal },
  );

  if (!response.ok) {
    const errorData = (await response.json().catch(() => null)) as {
      status_message?: string;
    } | null;
    throw new Error(
      errorData?.status_message ?? `TMDB details failed (${response.status})`,
    );
  }

  return (await response.json()) as TmdbMediaDetails;
}

// Builds the full link of an image from its path.
// `size` is the width (for example "w185" or "w500").
// Returns null if there is no image.
export function getTmdbImageUrl(path: string | null, size = "w185") {
  return path ? `${TMDB_IMAGE_BASE_URL.replace("w185", size)}${path}` : null;
}
