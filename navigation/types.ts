import type { TmdbMediaResult } from "../services/tmdb";

export type RootStackParamList = {
  Main: undefined;
  Login: undefined;
  Settings: undefined;
  MovieDetails: { result: TmdbMediaResult };
  // Profile pages. `uid` is the user whose data we show
  // (the logged-in user now, and friends later).
  Diary: { uid: string };
  UserWatchlist: { uid: string };
  MySeries: { uid: string };
  Watched: { uid: string };
  // Profile of another user, and their followers / following list.
  UserProfile: { uid: string; username: string };
  FollowList: { uid: string; type: "followers" | "following" };
};