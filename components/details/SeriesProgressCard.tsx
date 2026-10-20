// Details page (series only): "Your progress" card and its window
// to choose the season and episode the user stopped at.

import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import type { User } from "firebase/auth";
import ProgressModal from "../ProgressModal";
import {
  getAiredSeasons,
  getLatestAiredSeason,
  removeSeriesProgress,
  saveSeriesProgress,
  SeriesProgressMap,
  subscribeToSeriesProgress,
} from "../../services/seriesProgress";
import {
  getMediaKey,
  TmdbMediaDetails,
  TmdbMediaResult,
  toSavedMedia,
} from "../../services/tmdb";
import { colors } from "../../theme/colors";

type Props = {
  media: TmdbMediaResult;
  details: TmdbMediaDetails;
  user: User | null;
  onLoginNeeded: () => void;
  onError: (message: string) => void;
};

export default function SeriesProgressCard({
  media,
  details,
  user,
  onLoginNeeded,
  onError,
}: Props) {
  const uid = user?.uid;
  const mediaKey = getMediaKey(media);
  const [allProgress, setAllProgress] = useState<SeriesProgressMap>({});
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!uid) return;
    return subscribeToSeriesProgress(uid, setAllProgress);
  }, [uid]);

  const progress = allProgress[mediaKey];
  const lastAired = details.last_episode_to_air;
  const title = details.title ?? details.name ?? "Untitled";

  const openProgress = () => {
    if (!user) return onLoginNeeded();
    setOpen(true);
  };

  const save = async (season: number, episode: number) => {
    if (!user) return;
    setOpen(false);
    try {
      await saveSeriesProgress(user.uid, mediaKey, {
        media: toSavedMedia(media),
        season,
        episode,
        latestSeason: getLatestAiredSeason(details),
        finished:
          !!lastAired &&
          season === lastAired.season_number &&
          episode === lastAired.episode_number,
        updatedAt: Date.now(),
      });
    } catch {
      onError("Could not save your progress.");
    }
  };

  const remove = async () => {
    if (!user) return;
    setOpen(false);
    try {
      await removeSeriesProgress(user.uid, mediaKey);
    } catch {
      onError("Could not remove your progress.");
    }
  };

  return (
    <>
      <TouchableOpacity style={styles.card} onPress={openProgress}>
        <Ionicons name="play-circle-outline" size={22} color={colors.accent} />
        <View style={styles.copy}>
          <Text style={styles.label}>Your progress</Text>
          <Text style={styles.value}>
            {progress
              ? `Season ${progress.season} · Episode ${progress.episode}`
              : "Not started"}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      </TouchableOpacity>

      <ProgressModal
        visible={open}
        title={title}
        seasons={getAiredSeasons(details)}
        lastAired={
          lastAired
            ? {
                season: lastAired.season_number,
                episode: lastAired.episode_number,
              }
            : null
        }
        initial={progress ?? null}
        onClose={() => setOpen(false)}
        onSave={save}
        onRemove={remove}
      />
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
  },
  copy: { flex: 1 },
  label: { color: colors.textMuted, fontSize: 12 },
  value: { color: colors.text, fontSize: 15, fontWeight: "600", marginTop: 2 },
});
