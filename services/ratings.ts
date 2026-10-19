// This file manages the ratings (stars only, no comment) of movies and series.
// Each rating is a document in the "ratings" collection, named "{uid}_{mediaKey}",
// so a user has only one rating per title (rating again replaces it).
// Writing a review also saves its rating here.
// Ratings are not shown in "Recent activity", only reviews are.

import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { db } from "./firebase";
import {
  Review,
  subscribeToUserReviews,
} from "./reviews";

export type Rating = {
  uid: string;
  mediaKey: string; // "movie-123" or "tv-456"
  title: string;
  poster_path: string | null;
  rating: number; // 0.5 to 5 stars (steps of 0.5)
  updatedAt: number; // when the rating was saved, in milliseconds
};

const ratingRef = (uid: string, mediaKey: string) =>
  doc(db, "ratings", `${uid}_${mediaKey}`);

// Saves (or replaces) the rating of a user for one title.
export async function saveRating(rating: Rating) {
  await setDoc(ratingRef(rating.uid, rating.mediaKey), rating);
}

// Turns a review into a rating, so both can be mixed in one list.
// Old reviews were written before the "ratings" collection existed.
const reviewToRating = (review: Review): Rating => ({
  uid: review.uid,
  mediaKey: review.mediaKey,
  title: review.title,
  poster_path: review.poster_path,
  rating: review.rating,
  updatedAt: review.createdAt,
});

// Keeps only the newest rating for each key.
function keepNewest(ratings: Rating[], getKey: (rating: Rating) => string) {
  const newest: Record<string, Rating> = {};
  for (const rating of ratings) {
    const key = getKey(rating);
    if (!newest[key] || rating.updatedAt > newest[key].updatedAt) {
      newest[key] = rating;
    }
  }
  return Object.values(newest);
}

// Listens to everything a user has rated (with stars only or with a review),
// one entry per title with the newest rating, newest first.
export function subscribeToUserRatings(
  uid: string,
  onChange: (ratings: Rating[]) => void,
) {
  let ratings: Rating[] = [];
  let reviews: Rating[] = [];
  const update = () => {
    const all = keepNewest([...ratings, ...reviews], (r) => r.mediaKey);
    all.sort((a, b) => b.updatedAt - a.updatedAt);
    onChange(all);
  };

  const stopRatings = onSnapshot(
    query(collection(db, "ratings"), where("uid", "==", uid)),
    (snapshot) => {
      ratings = snapshot.docs.map((d) => d.data() as Rating);
      update();
    },
  );
  const stopReviews = subscribeToUserReviews(uid, (list) => {
    reviews = list.map(reviewToRating);
    update();
  });

  return () => {
    stopRatings();
    stopReviews();
  };
}

// Calculates the average rating of a movie/series from the app users.
// For each user, only their newest rating counts (from a review or from the stars).
export async function getAverageRating(mediaKey: string) {
  const [ratingsSnapshot, reviewsSnapshot] = await Promise.all([
    getDocs(query(collection(db, "ratings"), where("mediaKey", "==", mediaKey))),
    getDocs(query(collection(db, "reviews"), where("mediaKey", "==", mediaKey))),
  ]);

  const all = [
    ...ratingsSnapshot.docs.map((d) => d.data() as Rating),
    ...reviewsSnapshot.docs.map((d) => reviewToRating(d.data() as Review)),
  ];
  const values = keepNewest(all, (r) => r.uid).map((r) => r.rating);

  if (values.length === 0) {
    return { average: null, count: 0 };
  }
  const total = values.reduce((sum, value) => sum + value, 0);
  return { average: total / values.length, count: values.length };
}
