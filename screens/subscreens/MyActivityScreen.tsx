import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text } from "react-native";
import { useAuth } from "../../hooks/useAuth";
import ReviewItem from "../../components/ReviewItem";
import LoggedOutView from "../../components/LoggedOutView";
import {
  Review,
  reviewToMedia,
  subscribeToUserReviews,
} from "../../services/reviews";
import { colors } from "../../theme/colors";

export default function MyActivityScreen({ navigation }: any) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);

  const uid = user?.uid;

  useEffect(() => {
    if (!uid) return;
    return subscribeToUserReviews(uid, setReviews);
  }, [uid]);

  if (!user) {
    return <LoggedOutView message="Log in to see your activity." />;
  }

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
