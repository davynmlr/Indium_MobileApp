// Full screen window that plays a YouTube trailer inside the app,
// with a "Cinema mode" switch that dims the screen while watching.

import {
  Linking,
  Modal,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useCinemaMode } from "../hooks/useCinemaMode";
import type { TmdbVideo } from "../services/tmdb";
import { colors } from "../theme/colors";

// YouTube refuses to play embedded videos when the request has no "Referer"
// (error 153), so we send one that names our app.
const REFERER = "https://indium.app";

type Props = {
  visible: boolean;
  trailer: TmdbVideo;
  title: string;
  onClose: () => void;
};

export default function TrailerModal({
  visible,
  trailer,
  title,
  onClose,
}: Props) {
  const insets = useSafeAreaInsets();
  const cinema = useCinemaMode(visible);

  const embedUrl = `https://www.youtube.com/embed/${trailer.key}?autoplay=1&playsinline=1&rel=0`;
  const youtubeUrl = `https://www.youtube.com/watch?v=${trailer.key}`;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View
        style={[
          styles.container,
          { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 16 },
        ]}
      >
        <View style={styles.header}>
          <Pressable
            onPress={onClose}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Close the trailer"
          >
            <Ionicons name="close" size={28} color={colors.text} />
          </Pressable>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        </View>

        <View style={styles.playerArea}>
          {/* Only rendered while open, so the video stops when the window closes. */}
          {visible ? (
            <WebView
              style={styles.player}
              source={{ uri: embedUrl, headers: { Referer: REFERER } }}
              allowsInlineMediaPlayback
              allowsFullscreenVideo
              mediaPlaybackRequiresUserAction={false}
            />
          ) : null}
        </View>

        <View style={styles.cinemaRow}>
          <Ionicons
            name={cinema.enabled ? "moon" : "moon-outline"}
            size={20}
            color={cinema.enabled ? colors.accent : colors.textMuted}
          />
          <View style={styles.cinemaCopy}>
            <Text style={styles.cinemaLabel}>Cinema mode</Text>
            <Text style={styles.cinemaHint}>
              Dims the screen while you watch
            </Text>
          </View>
          <Switch
            value={cinema.enabled}
            onValueChange={cinema.toggle}
            trackColor={{ true: colors.accent, false: colors.border }}
            thumbColor={colors.text}
            accessibilityLabel="Cinema mode"
          />
        </View>

        <Pressable
          style={styles.youtubeButton}
          onPress={() => Linking.openURL(youtubeUrl).catch(() => {})}
          accessibilityRole="button"
        >
          <Ionicons name="logo-youtube" size={18} color={colors.textMuted} />
          <Text style={styles.youtubeText}>Open in YouTube</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  title: {
    flex: 1,
    color: colors.text,
    fontSize: 17,
    fontWeight: "700",
  },
  playerArea: {
    flex: 1,
    justifyContent: "center",
  },
  player: {
    width: "100%",
    aspectRatio: 16 / 9,
    flex: 0,
    backgroundColor: colors.black,
  },
  cinemaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 14,
  },
  cinemaCopy: { flex: 1 },
  cinemaLabel: { color: colors.text, fontSize: 15, fontWeight: "600" },
  cinemaHint: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  youtubeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 14,
  },
  youtubeText: { color: colors.textMuted, fontSize: 14 },
});
