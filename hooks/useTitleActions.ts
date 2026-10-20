// Everything the logged-in user can do with one movie/series on its details page:
// watchlist, stars, "watched" (eye) and reviews. Also loads the app users' average.

import { useEffect, useState } from "react";
import type { User } from "firebase/auth";
import {
  getMediaKey,
  TmdbMediaDetails,
  TmdbMediaResult,
  toSavedMedia,
} from "../services/tmdb";
import {
  isInWatchlist,
  removeFromWatchlist,
  saveWatchlist,
  subscribeToWatchlist,
} from "../services/watchlist";
import { addReview, subscribeToUserReviews } from "../services/reviews";
import {
  getAverageRating,
  Rating,
  removeRating,
  saveRating,
  subscribeToUserRatings,
} from "../services/ratings";

export type AverageRating = { average: number | null; count: number };

// `media` = the title from the previous page, `details` = the full data from TMDB.
// `onLoginNeeded` is called when a logged-out user tries to do something.
export function useTitleActions(
  media: TmdbMediaResult,
  details: TmdbMediaDetails,
  user: User | null,
  onLoginNeeded: () => void,
) {
  const uid = user?.uid;
  const mediaKey = getMediaKey(media);
  const title = details.title ?? details.name ?? "Untitled";
  const [error, setError] = useState<string | null>(null);

  // Watchlist: to know if this title is already in it.
  const [watchlist, setWatchlist] = useState<TmdbMediaResult[]>([]);
  useEffect(() => {
    if (!uid) return;
    return subscribeToWatchlist(uid, setWatchlist);
  }, [uid]);
  const inWatchlist = isInWatchlist(watchlist, media);

  // Average of the app users' ratings (each user's last rating only).
  const [average, setAverage] = useState<AverageRating>({
    average: null,
    count: 0,
  });
  const loadAverage = () => {
    getAverageRating(mediaKey)
      .then(setAverage)
      .catch(() => {});
  };
  useEffect(loadAverage, [mediaKey]);

  // The user's own rating of this title (0 = not rated yet).
  const [myRatings, setMyRatings] = useState<Rating[]>([]);
  useEffect(() => {
    if (!uid) return;
    return subscribeToUserRatings(uid, setMyRatings);
  }, [uid]);
  const myEntry = myRatings.find((rating) => rating.mediaKey === mediaKey);
  const myRating = myEntry?.rating ?? 0;
  // Watched = rated, reviewed, or marked with the eye button.
  const isWatched = myEntry !== undefined;

  // True if the user wrote a review of this title (then the stars can't be removed).
  const [hasReview, setHasReview] = useState(false);
  useEffect(() => {
    if (!uid) return;
    return subscribeToUserReviews(uid, (reviews) =>
      setHasReview(reviews.some((review) => review.mediaKey === mediaKey)),
    );
  }, [uid, mediaKey]);
  const canUnrate = myRating > 0 && !hasReview;

  // A rated or reviewed title has been watched, so it leaves the watchlist.
  const leaveWatchlist = async (me: User) => {
    if (inWatchlist) {
      await saveWatchlist(me.uid, removeFromWatchlist(watchlist, media));
    }
  };

  const saveMyRating = (me: User, rating: number, updatedAt: number) =>
    saveRating({
      uid: me.uid,
      mediaKey,
      title,
      poster_path: details.poster_path ?? null,
      rating,
      updatedAt,
    });

  // Saves the stars only (no review, so nothing in "Recent activity").
  const rate = async (rating: number) => {
    if (!user) return onLoginNeeded();
    try {
      await saveMyRating(user, rating, Date.now());
      await leaveWatchlist(user);
      loadAverage();
    } catch {
      setError("Could not save your rating.");
    }
  };

  // Cross button: removes the stars. The title stays watched (0 stars),
  // the eye button can then un-mark it.
  const unrate = () => {
    if (canUnrate) rate(0);
  };

  // Eye button: marks the title as watched without stars, or un-marks it.
  // A rated or reviewed title stays watched (the stars would be lost).
  const toggleWatched = async () => {
    if (!user) return onLoginNeeded();
    if (myRating > 0) return;
    try {
      if (isWatched) {
        await removeRating(user.uid, mediaKey);
      } else {
        await rate(0);
      }
    } catch {
      setError("Could not update watched.");
    }
  };

  const submitReview = async (rating: number, comment: string, date: Date) => {
    if (!user) return;
    const now = Date.now();
    try {
      await addReview({
        uid: user.uid,
        username: user.displayName ?? "",
        mediaKey,
        title,
        poster_path: details.poster_path ?? null,
        rating,
        comment,
        createdAt: now,
        date: date.getTime(),
      });
      // The review's stars also become the user's rating of this title.
      await saveMyRating(user, rating, now);
      await leaveWatchlist(user);
      loadAverage();
    } catch {
      setError("Could not save your review.");
    }
  };

  // Adds the title to the watchlist, or removes it if it is already there.
  const toggleWatchlist = async () => {
    if (!user) return onLoginNeeded();
    const next = inWatchlist
      ? removeFromWatchlist(watchlist, media)
      : [...watchlist, toSavedMedia(media)];
    try {
      await saveWatchlist(user.uid, next);
    } catch {
      setError("Could not update your watchlist.");
    }
  };

  return {
    error,
    inWatchlist,
    toggleWatchlist,
    average,
    myRating,
    isWatched,
    canUnrate,
    rate,
    unrate,
    toggleWatched,
    submitReview,
  };
}
