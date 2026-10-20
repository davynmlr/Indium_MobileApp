// Details page: the synopsis with a "Listen" button that reads it aloud,
// and the genres.

import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Speech from "expo-speech";
import type { TmdbMediaDetails } from "../../services/tmdb";
import { colors } from "../../theme/colors";

type Props = {
  title: string;
  details: TmdbMediaDetails;
};

export default function OverviewSection({ title, details }: Props) {
  const [speaking, setSpeaking] = useState(false);

  // Tap to start reading, tap again to stop.
  const toggleSpeech = () => {
    if (speaking) {
      Speech.stop();
      setSpeaking(false);
      return;
    }
    setSpeaking(true);
    Speech.speak(`${title}. ${details.overview}`, {
      language: "en-US",
      onDone: () => setSpeaking(false),
      // Also called when something else stops the voice (the trailer).
      onStopped: () => setSpeaking(false),
      onError: () => setSpeaking(false),
    });
  };

  // Stop reading when the page closes or shows another title.
  useEffect(() => {
    return () => {
      Speech.stop();
      setSpeaking(false);
    };
  }, [details.id, details.media_type]);

  return (
    <>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Overview</Text>
        {details.overview ? (
          <TouchableOpacity
            style={[styles.listenButton, speaking && styles.listenButtonActive]}
            onPress={toggleSpeech}
            accessibilityRole="button"
            accessibilityLabel={
              speaking ? "Stop reading" : "Listen to the synopsis"
            }
          >
            <Ionicons
              name={speaking ? "stop" : "volume-high-outline"}
              size={16}
              color={colors.text}
            />
            <Text style={styles.listenText}>
              {speaking ? "Stop" : "Listen"}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
      <Text style={styles.overview}>
        {details.overview || "No overview is available for this title."}
      </Text>

      {details.genres?.length ? (
        <View style={styles.genreRow}>
          {details.genres.map((genre) => (
            <View key={genre.id} style={styles.genre}>
              <Text style={styles.genreText}>{genre.name}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
    marginTop: 24,
  },
  listenButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  listenButtonActive: { backgroundColor: colors.accent },
  listenText: { color: colors.text, fontSize: 13, fontWeight: "600" },
  overview: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
  },
  genreRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 18 },
  genre: {
    backgroundColor: colors.border,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  genreText: { color: colors.text, fontSize: 12 },
});
