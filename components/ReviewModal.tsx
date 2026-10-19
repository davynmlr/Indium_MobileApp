// Small window to review a movie/series: choose the date, the stars and write a comment.

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
import DateTimePicker from "@react-native-community/datetimepicker";
import { colors } from "../theme/colors";
import StarRating from "./StarRating";

type Props = {
  visible: boolean;
  title: string;
  onClose: () => void;
  onSubmit: (rating: number, comment: string, date: Date) => void;
};

export default function ReviewModal({ visible, title, onClose, onSubmit }: Props) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  // Date when the user watched it (today by default)
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Start with an empty form each time the window opens.
  useEffect(() => {
    if (visible) {
      setRating(0);
      setComment("");
      setDate(new Date());
      setShowDatePicker(false);
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

          <Pressable style={styles.dateRow} onPress={() => setShowDatePicker(true)}>
            <Ionicons name="calendar-outline" size={18} color={colors.accent} />
            <Text style={styles.dateText}>{date.toLocaleDateString()}</Text>
          </Pressable>
          {showDatePicker ? (
            <DateTimePicker
              value={date}
              mode="date"
              maximumDate={new Date()} // can't review something watched in the future
              onChange={(event, pickedDate) => {
                setShowDatePicker(false);
                // pickedDate is undefined if the user pressed "Cancel"
                if (pickedDate) setDate(pickedDate);
              }}
            />
          ) : null}

          <View style={styles.stars}>
            <StarRating rating={rating} onChange={setRating} />
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
            onPress={() => onSubmit(rating, comment.trim(), date)}
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
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 8,
    backgroundColor: colors.background,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 14,
  },
  dateText: {
    color: colors.text,
    fontSize: 14,
  },
  stars: {
    marginTop: 20,
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
