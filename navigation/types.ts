import type { TmdbMediaResult } from "../services/tmdb";

export type RootStackParamList = {
  Main: undefined;
  Login: undefined;
  Settings: undefined;
  MovieDetails: { result: TmdbMediaResult };
};