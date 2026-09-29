import type { TmdbMediaResult } from "../services/tmdb";

export type RootStackParamList = {
  Main: undefined;
  Login: undefined;
  MovieDetails: { result: TmdbMediaResult };
};