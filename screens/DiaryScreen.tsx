import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import ReviewItem from "../components/ReviewItem";
import {
  Review,
  reviewToMedia,
  subscribeToUserReviews,
} from "../services/reviews";
import type { RootStackParamList } from "../navigation/types";
import { colors } from "../theme/colors";

type Props = NativeStackScreenProps<RootStackParamList, "Diary">;

// All the reviews of a user, newest first.
// route.params.uid says whose diary to show.
export default function DiaryScreen({ route, navigation }: Props) {
  const { uid } = route.params;
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => subscribeToUserReviews(uid, setReviews), [uid]);

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.list}
      data={reviews}
      keyExtractor={(item) => `${item.mediaKey}-${item.createdAt}`}
      ListEmptyComponent={<Text style={styles.text}>No reviews yet.</Text>}
      renderItem={({ item }) => (
        <ReviewItem
          review={item}
          onPress={() =>
            navigation.navigate("MovieDetails", { result: reviewToMedia(item) })
          }
        />
      )}
    />
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
