// Edit and delete for the logged-in user's own reviews.
// Gives `startEdit` and `confirmDelete` for the buttons of each review,
// and `editModal`, the review window to put once in the screen.

import { useState } from "react";
import { Alert } from "react-native";
import ReviewModal from "../components/ReviewModal";
import { deleteReview, Review, updateReview } from "../services/reviews";
import { saveRating } from "../services/ratings";

// `reviews` = all the reviews of the user (to know which one is the newest of a title).
export function useReviewActions(reviews: Review[]) {
  const [editing, setEditing] = useState<Review | null>(null);

  // True if no other review of the same title was written after this one.
  const isNewestOfTitle = (review: Review) =>
    reviews.every(
      (other) =>
        other.mediaKey !== review.mediaKey ||
        other.id === review.id ||
        other.createdAt <= review.createdAt,
    );

  const saveEdit = async (rating: number, comment: string, date: Date) => {
    const review = editing;
    setEditing(null);
    if (!review?.id) return;
    try {
      await updateReview(review.id, { rating, comment, date: date.getTime() });
      // The newest review's stars are the user's rating of the title, so update it too.
      if (isNewestOfTitle(review)) {
        await saveRating({
          uid: review.uid,
          mediaKey: review.mediaKey,
          title: review.title,
          poster_path: review.poster_path,
          rating,
          updatedAt: Date.now(),
        });
      }
    } catch {
      Alert.alert("Could not save your review.");
    }
  };

  // Asks before deleting, because it can't be undone.
  const confirmDelete = (review: Review) => {
    if (!review.id) return;
    const id = review.id;
    Alert.alert(
      "Delete review?",
      `Your review of ${review.title} will be deleted.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () =>
            deleteReview(id).catch(() =>
              Alert.alert("Could not delete the review."),
            ),
        },
      ],
    );
  };

  const editModal = (
    <ReviewModal
      visible={editing !== null}
      title={editing?.title ?? ""}
      initial={editing ?? undefined}
      onClose={() => setEditing(null)}
      onSubmit={saveEdit}
    />
  );

  return { startEdit: setEditing, confirmDelete, editModal };
}
