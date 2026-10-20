import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import ReviewItem from "../components/ReviewItem";
import { useAuth } from "../hooks/useAuth";
import { useReviewActions } from "../hooks/useReviewActions";
import {
  Review,
  subscribeToUserReviews,
} from "../services/reviews";
import { mediaFromKey } from "../services/tmdb";
import type { RootStackParamList } from "../navigation/types";
import { colors } from "../theme/colors";

type Props = NativeStackScreenProps<RootStackParamList, "Diary">;

// All the reviews of a user, newest first.
// route.params.uid says whose diary to show.
export default function DiaryScreen({ route, navigation }: Props) {
  const { uid } = route.params;
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => subscribeToUserReviews(uid, setReviews), [uid]);

  // Your own diary: reviews can be edited and deleted.
  const { user } = useAuth();
  const isMine = user?.uid === uid;
  const { startEdit, confirmDelete, editModal } = useReviewActions(reviews);

  return (
    <>
      <FlatList
        style={styles.container}
        contentContainerStyle={styles.list}
        data={reviews}
        keyExtractor={(item) => item.id ?? `${item.mediaKey}-${item.createdAt}`}
        ListEmptyComponent={<Text style={styles.text}>No reviews yet.</Text>}
        renderItem={({ item }) => (
          <ReviewItem
            review={item}
            onPress={() =>
              navigation.navigate("MovieDetails", {
                result: mediaFromKey(item),
              })
            }
            onEdit={isMine ? () => startEdit(item) : undefined}
            onDelete={isMine ? () => confirmDelete(item) : undefined}
          />
        )}
      />
      {editModal}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    padding: 16,
  },
  text: {
    color: colors.textMuted,
    fontSize: 15,
    textAlign: "center",
    marginTop: 20,
  },
});
