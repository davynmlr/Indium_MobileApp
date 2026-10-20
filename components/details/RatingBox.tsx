// Details page: "Rate it" box with the ✕ (remove stars), the stars,
// and the eye (watched without rating).

import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import StarRating from "../StarRating";
import { colors } from "../../theme/colors";

type Props = {
  rating: number; // the user's stars, 0 = not rated
  isWatched: boolean;
  canUnrate: boolean; // rated without a review
  onRate: (rating: number) => void;
  onUnrate: () => void;
  onToggleWatched: () => void;
};

export default function RatingBox({
  rating,
  isWatched,
  canUnrate,
  onRate,
  onUnrate,
  onToggleWatched,
}: Props) {
  return (
    <View style={styles.box}>
      <Text style={styles.label}>
        {rating > 0 ? `Your rating: ${rating} / 5` : "Rate it"}
      </Text>
      <View style={styles.row}>
        {/* Always takes the same space, so the stars don't move. */}
        <TouchableOpacity
          onPress={onUnrate}
          disabled={!canUnrate}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Remove your rating"
          accessibilityElementsHidden={!canUnrate}
          importantForAccessibility={canUnrate ? "auto" : "no-hide-descendants"}
          style={[styles.unrateButton, !canUnrate && styles.hidden]}
        >
          <Ionicons name="close-circle" size={24} color={colors.textMuted} />
        </TouchableOpacity>
        <StarRating rating={rating} onChange={onRate} size={30} />
        <TouchableOpacity
          onPress={onToggleWatched}
          disabled={rating > 0}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityState={{ selected: isWatched }}
          accessibilityLabel={isWatched ? "Watched" : "Mark as watched"}
          style={styles.watchedButton}
        >
          <Ionicons
            name={isWatched ? "eye" : "eye-outline"}
            size={30}
            color={isWatched ? colors.accent : colors.textMuted}
          />
          <Text
            style={[styles.watchedText, isWatched && styles.watchedTextActive]}
          >
            {isWatched ? "Watched" : "Watch"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 10,
    alignItems: "center",
    gap: 8,
  },
  label: { color: colors.textMuted, fontSize: 13, fontWeight: "600" },
  row: { flexDirection: "row", alignItems: "center", gap: 16 },
  unrateButton: { width: 30, alignItems: "center" },
  hidden: { opacity: 0 },
  watchedButton: { alignItems: "center" },
  watchedText: { color: colors.textMuted, fontSize: 11, marginTop: 2 },
  watchedTextActive: { color: colors.accent, fontWeight: "600" },
});
