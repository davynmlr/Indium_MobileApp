// One review in a list: poster, title, stars, comment and date.
// Used in the Profile, Diary and Friends screens.

import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { getTmdbImageUrl } from "../services/tmdb";
import { getReviewDate, getStarIcon, Review } from "../services/reviews";
import { colors } from "../theme/colors";

type Props = {
  review: Review;
  onPress: () => void;
  // Friends feed: show who wrote the review. Tapping the name calls onUserPress.
  showUser?: boolean;
  onUserPress?: () => void;
};

export default function ReviewItem({
  review,
  onPress,
  showUser,
  onUserPress,
}: Props) {
  const imageUrl = getTmdbImageUrl(review.poster_path);
  const date = new Date(getReviewDate(review)).toLocaleDateString();

  return (
    <Pressable style={styles.item} onPress={onPress}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.poster} />
      ) : (
        <View style={styles.poster} />
      )}
      <View style={styles.info}>
        {showUser ? (
          <Pressable onPress={onUserPress} hitSlop={6} style={styles.userRow}>
            <Text style={styles.user} numberOfLines={1}>
              {review.username}
            </Text>
            <Text style={styles.userAction}> reviewed</Text>
          </Pressable>
        ) : null}
        <Text style={styles.title} numberOfLines={1}>
          {review.title}
        </Text>
        <View style={styles.stars}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Ionicons
              key={star}
              name={getStarIcon(review.rating, star)}
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
  userRow: {
    flexDirection: "row",
    alignSelf: "flex-start",
    marginBottom: 2,
  },
  user: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: "700",
  },
  userAction: {
    color: colors.textMuted,
    fontSize: 13,
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
