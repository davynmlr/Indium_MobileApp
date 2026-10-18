// One review in a list: poster, title, stars, comment and date.
// Used in the Activity screen and in the Profile screen.

import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { getTmdbImageUrl } from "../services/tmdb";
import type { Review } from "../services/reviews";
import { colors } from "../theme/colors";

type Props = {
  review: Review;
  onPress: () => void;
};

export default function ReviewItem({ review, onPress }: Props) {
  const imageUrl = getTmdbImageUrl(review.poster_path);
  const date = new Date(review.createdAt).toLocaleDateString();

  return (
    <Pressable style={styles.item} onPress={onPress}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.poster} />
      ) : (
        <View style={styles.poster} />
      )}
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {review.title}
        </Text>
        <View style={styles.stars}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Ionicons
              key={star}
              name={
                review.rating >= star
                  ? "star"
                  : review.rating === star - 0.5
                    ? "star-half"
                    : "star-outline"
              }
              size={14}
              color={colors.accent}
            />
          ))}
        </View>
        {review.comment ? (
          <Text style={styles.comment} numberOfLines={3}>
            {review.comment}
          </Text>
        ) : null}
        <Text style={styles.date}>{date}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 10,
    gap: 12,
    marginBottom: 10,
  },
  poster: {
    width: 50,
    aspectRatio: 2 / 3,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  info: {
    flex: 1,
  },
  title: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700",
  },
  stars: {
    flexDirection: "row",
    gap: 2,
    marginTop: 4,
  },
  comment: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 6,
  },
  date: {
    color: colors.placeholder,
    fontSize: 11,
    marginTop: 6,
  },
});
