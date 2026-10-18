// This file manages the reviews of movies and series.
// Each review is a document in the "reviews" collection.
// A user can review the same title many times: every review is kept,
// but only the user's LAST rating counts for the average.

import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
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
  createdAt: number; // date in milliseconds
};

// A movie and a series can have the same id, so we add the type in front.
export const getMediaKey = (media: TmdbMediaResult) =>
  `${media.media_type}-${media.id}`;

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
