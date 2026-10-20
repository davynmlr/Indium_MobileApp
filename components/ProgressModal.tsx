// Small window to choose where the user stopped watching a series (season + episode).

import { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import Chip from "./Chip";
import { colors } from "../theme/colors";
import type { TmdbSeason } from "../services/tmdb";

type Props = {
  visible: boolean;
  title: string;
  seasons: TmdbSeason[]; // seasons already out (no specials)
  // Newest episode out, used by the "I'm up to date" button.
  lastAired: { season: number; episode: number } | null;
  initial: { season: number; episode: number } | null; // current progress
  onClose: () => void;
  onSave: (season: number, episode: number) => void;
  onRemove: () => void;
};

export default function ProgressModal({
  visible,
  title,
  seasons,
  lastAired,
  initial,
  onClose,
  onSave,
  onRemove,
}: Props) {
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);

  // Start from the saved progress each time the window opens.
  useEffect(() => {
    if (visible) {
      setSeason(initial?.season ?? seasons[0]?.season_number ?? 1);
      setEpisode(initial?.episode ?? 1);
    }
  }, [visible]);

  // Episodes of the chosen season. For the season airing now,
  // only the episodes already out can be picked.
  const selected = seasons.find((item) => item.season_number === season);
  let episodeCount = selected?.episode_count ?? 0;
  if (lastAired && season === lastAired.season) {
    episodeCount = Math.min(episodeCount, lastAired.episode);
  }
  const episodes = Array.from({ length: episodeCount }, (_, i) => i + 1);

  const pickSeason = (number: number) => {
    setSeason(number);
    setEpisode(1);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.box}>
          <View style={styles.header}>
            <Text style={styles.title} numberOfLines={2}>
              Where did you stop in {title}?
            </Text>
            <Pressable onPress={onClose} hitSlop={12}>
              <Ionicons name="close" size={24} color={colors.text} />
            </Pressable>
          </View>

          {seasons.length === 0 ? (
            <Text style={styles.empty}>No episodes are out yet.</Text>
          ) : (
            <>
              <Text style={styles.label}>Season</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.row}>
                  {seasons.map((item) => (
                    <Chip
                      key={item.season_number}
                      label={`S${item.season_number}`}
                      active={item.season_number === season}
                      onPress={() => pickSeason(item.season_number)}
                      variant="background"
                      size="large"
                    />
                  ))}
                </View>
              </ScrollView>

              <Text style={styles.label}>Episode</Text>
              <ScrollView style={styles.episodes}>
                <View style={styles.grid}>
                  {episodes.map((number) => (
                    <Chip
                      key={number}
                      label={`${number}`}
                      active={number === episode}
                      onPress={() => setEpisode(number)}
                      variant="background"
                      size="large"
                    />
                  ))}
                </View>
              </ScrollView>

              <TouchableOpacity
                style={styles.button}
                onPress={() => onSave(season, episode)}
                disabled={episodes.length === 0}
              >
                <Text style={styles.buttonText}>
                  Save S{season} · E{episode}
                </Text>
              </TouchableOpacity>

              {lastAired ? (
                <TouchableOpacity
                  style={[styles.button, styles.secondaryButton]}
                  onPress={() => onSave(lastAired.season, lastAired.episode)}
                >
                  <Text style={styles.buttonText}>I&apos;m up to date</Text>
                </TouchableOpacity>
              ) : null}
            </>
          )}

          {initial ? (
            <Pressable onPress={onRemove} style={styles.remove} hitSlop={8}>
              <Text style={styles.removeText}>Remove my progress</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: "center",
    padding: 24,
  },
  box: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    maxHeight: "85%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  title: { flex: 1, color: colors.text, fontSize: 18, fontWeight: "700" },
  empty: { color: colors.textMuted, marginTop: 16 },
  label: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  row: { flexDirection: "row", gap: 8 },
  episodes: { maxHeight: 180 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  button: {
    backgroundColor: colors.accent,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 16,
  },
  secondaryButton: {
    backgroundColor: colors.background,
    marginTop: 10,
  },
  buttonText: { color: colors.text, fontSize: 15, fontWeight: "600" },
  remove: { alignSelf: "center", marginTop: 14 },
  removeText: { color: colors.textMuted, fontSize: 13 },
});
