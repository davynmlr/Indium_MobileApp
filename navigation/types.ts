import type { TmdbMediaResult } from "../services/tmdb";

export type RootStackParamList = {
  Main: undefined;
  MovieDetails: { result: TmdbMediaResult };
};