// A small round button used for filters and choices
// (All / Movies / Series, sort, genres, ratings, seasons, episodes...).
// The selected one (`active`) is filled with the accent color.

import type { ComponentProps } from "react";
import {
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { colors } from "../theme/colors";

type Props = {
  label: string;
  onPress: () => void;
  active?: boolean;
  icon?: ComponentProps<typeof Ionicons>["name"]; // small icon before the text
  iconColor?: string; // default: text color
  disabled?: boolean;
  // "surface" on screens, "background" inside windows (which are already "surface").
  variant?: "surface" | "background";
  size?: "small" | "large";
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

export default function Chip({
  label,
  onPress,
  active = false,
  icon,
  iconColor = colors.text,
  disabled,
  variant = "surface",
  size = "small",
  style,
  accessibilityLabel,
}: Props) {
  return (
    <TouchableOpacity
      style={[
        styles.chip,
        variant === "background" && styles.onSurface,
        size === "large" && styles.large,
        active && styles.active,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ selected: active, disabled }}
      accessibilityLabel={accessibilityLabel}
    >
      {icon ? <Ionicons name={icon} size={12} color={iconColor} /> : null}
      <Text style={[styles.text, size === "large" && styles.largeText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  onSurface: { backgroundColor: colors.background },
  large: {
    borderRadius: 18,
    minWidth: 44,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  active: { backgroundColor: colors.accent },
  text: { color: colors.text, fontSize: 13, fontWeight: "600" },
  largeText: { fontSize: 14 },
});
