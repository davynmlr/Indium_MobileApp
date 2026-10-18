// Small window to review a movie/series: choose stars and write a comment.

import { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { colors } from "../theme/colors";
import { getStarIcon } from "../services/reviews";

type Props = {
  visible: boolean;
  title: string;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => void;
};

export default function ReviewModal({ visible, title, onClose, onSubmit }: Props) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  // Start with an empty form each time the window opens.
  useEffect(() => {
    if (visible) {
      setRating(0);
      setComment("");
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.box}>
          <View style={styles.header}>
            <Text style={styles.title} numberOfLines={2}>
              Review {title}
            </Text>
            <Pressable onPress={onClose} hitSlop={12}>
              <Ionicons name="close" size={24} color={colors.text} />
            </Pressable>
          </View>

          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map((star) => (
              <View key={star}>
                <Ionicons
                  name={getStarIcon(rating, star)}
                  size={36}
                  color={colors.accent}
                />
                {/* Left half of the star gives x.5, right half gives the full star */}
                <Pressable
                  style={[styles.starHalf, { left: 0 }]}
                  onPress={() => setRating(star - 0.5)}
                />
                <Pressable
                  style={[styles.starHalf, { right: 0 }]}
                  onPress={() => setRating(star)}
                />
              </View>
            ))}
          </View>
          <Text style={styles.ratingText}>
            {rating > 0 ? `${rating} / 5` : "Tap the stars to rate"}
          </Text>

          <TextInput
            style={styles.input}
            value={comment}
            onChangeText={setComment}
            placeholder="Write a comment (optional)"
            placeholderTextColor={colors.placeholder}
            multiline
          />

          <TouchableOpacity
            style={[styles.button, rating === 0 && styles.buttonDisabled]}
            onPress={() => onSubmit(rating, comment.trim())}
            disabled={rating === 0}
          >
            <Text style={styles.buttonText}>Save review</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    padding: 24,
  },
  box: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  title: {
    flex: 1,
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
  },
  stars: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginTop: 20,
  },
  // Invisible button covering half of a star.
  starHalf: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: "50%",
  },
  ratingText: {
    color: colors.textMuted,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 8,
    color: colors.text,
    minHeight: 90,
    padding: 10,
    textAlignVertical: "top",
  },
  button: {
    backgroundColor: colors.accent,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 16,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "600",
  },
});
