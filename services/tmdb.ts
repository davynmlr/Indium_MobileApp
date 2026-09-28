export type TmdbMediaResult = {
  id: number;
  media_type: "movie" | "tv";
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  poster_path: string | null;
  overview: string;
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

export function getTmdbImageUrl(path: string | null) {
  return path ? `${TMDB_IMAGE_BASE_URL}${path}` : null;
}
