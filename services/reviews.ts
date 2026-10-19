// This file manages the reviews of movies and series.
// Each review is a document in the "reviews" collection.
// A user can review the same title many times: every review is kept.
// The average rating is calculated in ratings.ts.

import {
  addDoc,
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { db } from "./firebase";
import type { TmdbMediaResult } from "./tmdb";

export type Review = {
  uid: string;
  username: string;
  mediaKey: string; // "movie-123" or "tv-456"
  title: string;
  poster_path: string | null;
  rating: number; // 0.5 to 5 stars (steps of 0.5)
  comment: string;
  createdAt: number; // when the review was saved, in milliseconds
  date?: number; // when the user watched it, chosen in the review window (old reviews don't have it)
};

// Saves a new review in the database.
export async function addReview(review: Review) {
  await addDoc(collection(db, "reviews"), review);
}

// Listens to all the reviews written by one user, newest first.
// Each time they change, `onChange` is called with the new list.
// It returns a function to stop listening (use it when the screen closes).
export function subscribeToUserReviews(
  uid: string,
  onChange: (reviews: Review[]) => void,
) {
  return onSnapshot(
    query(collection(db, "reviews"), where("uid", "==", uid)),
    (snapshot) => {
      const reviews = snapshot.docs.map((document) => document.data() as Review);
      // Sort here instead of in the query, so Firestore doesn't need an extra index.
      reviews.sort((a, b) => getReviewDate(b) - getReviewDate(a));
      onChange(reviews);
    },
  );
}

// Listens to the reviews of several users at once (the people the user follows),
// newest first. Firestore's "in" accepts at most 30 values, so we split the
// list in groups of 30 and listen to each group.
// It returns a function to stop listening to all groups.
export function subscribeToReviewsOfUsers(
  uids: string[],
  onChange: (reviews: Review[]) => void,
) {
  if (uids.length === 0) {
    onChange([]);
    return () => {};
  }

  // Reviews of each group, merged each time one group changes.
  const groups: Review[][] = [];
  const stops: (() => void)[] = [];
  for (let i = 0; i < uids.length; i += 30) {
    const index = groups.length;
    groups.push([]);
    stops.push(
      onSnapshot(
        query(
          collection(db, "reviews"),
          where("uid", "in", uids.slice(i, i + 30)),
        ),
        (snapshot) => {
          groups[index] = snapshot.docs.map((d) => d.data() as Review);
          const all = groups.flat();
          all.sort((a, b) => getReviewDate(b) - getReviewDate(a));
          onChange(all);
        },
      ),
    );
  }
  return () => stops.forEach((stop) => stop());
}

// Turns a review back into a movie/series, to open its details page.
// mediaKey looks like "movie-123", so we split it to get the type and the id.
export function reviewToMedia(review: Review): TmdbMediaResult {
  const [mediaType, id] = review.mediaKey.split("-");
  return {
    id: Number(id),
    media_type: mediaType as TmdbMediaResult["media_type"],
    title: review.title,
    poster_path: review.poster_path,
    overview: "",
  };
}

// Gives the icon to show for one star, depending on the rating.
// Example with a rating of 3.5: stars 1-3 are full, star 4 is half, star 5 is empty.
export function getStarIcon(rating: number, star: number) {
  if (rating >= star) return "star";
  if (rating === star - 0.5) return "star-half";
  return "star-outline";
}

// The date to show for a review: the chosen date,
// or the save date for old reviews that don't have one.
export function getReviewDate(review: Review) {
  return review.date ?? review.createdAt;
}
