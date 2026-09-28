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

export type TmdbMediaDetails = TmdbMediaResult & {
  genres?: { id: number; name: string }[];
  runtime?: number | null;
  number_of_seasons?: number;
  number_of_episodes?: number;
  status?: string;
  tagline?: string;
};

type TmdbSearchResponse = {
  results: TmdbMediaResult[];
};

const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w185";

export async function searchTmdb(query: string, signal?: AbortSignal) {
  const apiKey = process.env.EXPO_PUBLIC_TMDB_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("Missing EXPO_PUBLIC_TMDB_API_KEY");
  }

  const response = await fetch(
    `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&query=${encodeURIComponent(
      query,
    )}&include_adult=false&language=en-US`,
    { signal },
  );

  if (!response.ok) {
    const errorData = (await response.json().catch(() => null)) as {
      status_message?: string;
    } | null;
    throw new Error(
      errorData?.status_message ?? `TMDB search failed (${response.status})`,
    );
  }

  const data = (await response.json()) as TmdbSearchResponse;

  return data.results.filter(
    (result) => result.media_type === "movie" || result.media_type === "tv",
  );
}

export async function getTmdbDetails(
  mediaType: TmdbMediaResult["media_type"],
  id: number,
  signal?: AbortSignal,
) {
  const apiKey = process.env.EXPO_PUBLIC_TMDB_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("Missing EXPO_PUBLIC_TMDB_API_KEY");
  }

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

export function getTmdbImageUrl(path: string | null, size = "w185") {
  return path ? `${TMDB_IMAGE_BASE_URL.replace("w185", size)}${path}` : null;
}
