// This file manages the reviews of movies and series.
// Each review is a document in the "reviews" collection.
// A user can review the same title many times: every review is kept,
// but only the user's LAST rating counts for the average.

import {
  addDoc,
  collection,
  getDocs,
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

// Calculates the average rating of a movie/series.
// For each user, we only keep their most recent review.
export async function getAverageRating(mediaKey: string) {
  const snapshot = await getDocs(
    query(collection(db, "reviews"), where("mediaKey", "==", mediaKey)),
  );

  // uid -> last review of this user
  const lastReviews: Record<string, Review> = {};
  snapshot.forEach((document) => {
    const review = document.data() as Review;
    const previous = lastReviews[review.uid];
    if (!previous || review.createdAt > previous.createdAt) {
      lastReviews[review.uid] = review;
    }
  });

  const ratings = Object.values(lastReviews).map((review) => review.rating);
  if (ratings.length === 0) {
    return { average: null, count: 0 };
  }
  const total = ratings.reduce((sum, rating) => sum + rating, 0);
  return { average: total / ratings.length, count: ratings.length };
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
