// 5 stars the user can tap to rate.
// The left half of a star gives x.5, the right half gives the full star.
// Used in the review window and on the details page.

import { Pressable, StyleSheet, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { getStarIcon } from "../services/reviews";
import { colors } from "../theme/colors";

type Props = {
  rating: number; // 0 = no rating yet
  onChange: (rating: number) => void;
  size?: number;
};

export default function StarRating({ rating, onChange, size = 36 }: Props) {
  return (
    <View style={styles.stars}>
      {[1, 2, 3, 4, 5].map((star) => (
        <View key={star}>
          <Ionicons
            name={getStarIcon(rating, star)}
            size={size}
            color={colors.accent}
          />
          <Pressable
            style={[styles.starHalf, { left: 0 }]}
            onPress={() => onChange(star - 0.5)}
            accessibilityLabel={`${star - 0.5} stars`}
          />
          <Pressable
            style={[styles.starHalf, { right: 0 }]}
            onPress={() => onChange(star)}
            accessibilityLabel={`${star} stars`}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  stars: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  // Invisible button covering half of a star.
  starHalf: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: "50%",
  },
});
