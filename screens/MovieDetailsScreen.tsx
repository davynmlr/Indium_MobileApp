import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";

import {
  getTmdbDetails,
  getTmdbImageUrl,
  getMediaKey,
  TmdbMediaDetails,
  TmdbMediaResult,
  toSavedMedia,
} from "../services/tmdb";
import { useAuth } from "../hooks/useAuth";
import {
  isInWatchlist,
  removeFromWatchlist,
  saveWatchlist,
  subscribeToWatchlist,
} from "../services/watchlist";
import { addReview, getAverageRating } from "../services/reviews";
import {
  getAiredSeasons,
  getLatestAiredSeason,
  removeSeriesProgress,
  saveSeriesProgress,
  SeriesProgressMap,
  subscribeToSeriesProgress,
} from "../services/seriesProgress";
import ReviewModal from "../components/ReviewModal";
import ProgressModal from "../components/ProgressModal";
import type { RootStackParamList } from "../navigation/types";
import { colors } from "../theme/colors";

type Props = NativeStackScreenProps<RootStackParamList, "MovieDetails">;

export default function MovieDetailsScreen({ route, navigation }: Props) {
  const { result } = route.params;
  const [details, setDetails] = useState<TmdbMediaDetails>(result);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const [watchlist, setWatchlist] = useState<TmdbMediaResult[]>([]);

  const uid = user?.uid;

  // Listen to the watchlist to know if this movie is already in it.
  useEffect(() => {
    if (!uid) return;
    return subscribeToWatchlist(uid, setWatchlist);
  }, [uid]);

  const inWatchlist = isInWatchlist(watchlist, result);

  // Series only: where the user stopped watching.
  const isSeries = result.media_type === "tv";
  const mediaKey = getMediaKey(result);
  const [allProgress, setAllProgress] = useState<SeriesProgressMap>({});
  const [progressOpen, setProgressOpen] = useState(false);

  useEffect(() => {
    if (!uid || !isSeries) return;
    return subscribeToSeriesProgress(uid, setAllProgress);
  }, [uid, isSeries]);

  const progress = allProgress[mediaKey];

  const [reviewOpen, setReviewOpen] = useState(false);
  // Average of the app users' ratings (each user's last rating only).
  const [userRating, setUserRating] = useState<{
    average: number | null;
    count: number;
  }>({ average: null, count: 0 });

  const loadUserRating = () => {
    getAverageRating(getMediaKey(result))
      .then(setUserRating)
      .catch(() => {});
  };

  useEffect(loadUserRating, [result.id, result.media_type]);

  const openReview = () => {
    if (!user) {
      navigation.navigate("Login");
      return;
    }
    setReviewOpen(true);
  };

  const submitReview = async (rating: number, comment: string, date: Date) => {
    if (!user) return;
    setReviewOpen(false);
    try {
      await addReview({
        uid: user.uid,
        username: user.displayName ?? "",
        mediaKey: getMediaKey(result),
        title: details.title ?? details.name ?? "Untitled",
        poster_path: details.poster_path ?? null,
        rating,
        comment,
        createdAt: Date.now(),
        date: date.getTime(),
      });
      // A reviewed movie has been watched, so it leaves the watchlist.
      if (inWatchlist) {
        await saveWatchlist(user.uid, removeFromWatchlist(watchlist, result));
      }
      loadUserRating();
    } catch {
      setError("Could not save your review.");
    }
  };

  // Adds the movie to the watchlist, or removes it if it is already there.
  const toggleWatchlist = async () => {
    if (!user) {
      navigation.navigate("Login");
      return;
    }
    const next = inWatchlist
      ? removeFromWatchlist(watchlist, result)
      : [...watchlist, toSavedMedia(result)];
    try {
      await saveWatchlist(user.uid, next);
    } catch {
      setError("Could not update your watchlist.");
    }
  };

  const openProgress = () => {
    if (!user) {
      navigation.navigate("Login");
      return;
    }
    setProgressOpen(true);
  };

  const saveProgress = async (season: number, episode: number) => {
    if (!user) return;
    setProgressOpen(false);
    try {
      await saveSeriesProgress(user.uid, mediaKey, {
        media: toSavedMedia(result),
        season,
        episode,
        latestSeason: getLatestAiredSeason(details),
        updatedAt: Date.now(),
      });
    } catch {
      setError("Could not save your progress.");
    }
  };

  const removeProgress = async () => {
    if (!user) return;
    setProgressOpen(false);
    try {
      await removeSeriesProgress(user.uid, mediaKey);
    } catch {
      setError("Could not remove your progress.");
    }
  };

  useEffect(() => {
    const controller = new AbortController();

    getTmdbDetails(result.media_type, result.id, controller.signal)
      .then(setDetails)
      .catch((requestError: Error) => {
        if (requestError.name !== "AbortError") {
          setError("Some additional details could not be loaded.");
        }
      });

    return () => controller.abort();
  }, [result.id, result.media_type]);

  const title = details.title ?? details.name ?? "Untitled";
  const date = details.release_date ?? details.first_air_date;
  const posterUrl = getTmdbImageUrl(details.poster_path, "w500");
  const mediaLabel = result.media_type === "movie" ? "Movie" : "Series";

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.content}>
        {posterUrl ? (
          <Image source={{ uri: posterUrl }} style={styles.poster} />
        ) : (
          <View style={[styles.poster, styles.posterPlaceholder]}>
            <Ionicons name="film-outline" size={42} color={colors.textMuted} />
          </View>
        )}

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.meta}>
          {mediaLabel}
          {date ? ` · ${date.slice(0, 4)}` : ""}
          {details.runtime ? ` · ${details.runtime} min` : ""}
        </Text>

        <TouchableOpacity
          style={[styles.watchlistButton, inWatchlist && styles.watchlistButtonActive]}
          onPress={toggleWatchlist}
        >
          <Text style={styles.watchlistButtonText}>
            {inWatchlist ? "- Watchlist" : "+ Watchlist"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.reviewButton} onPress={openReview}>
          <Text style={styles.watchlistButtonText}>Review</Text>
        </TouchableOpacity>

        <ReviewModal
          visible={reviewOpen}
          title={title}
          onClose={() => setReviewOpen(false)}
          onSubmit={submitReview}
        />

        {isSeries ? (
          <>
            <TouchableOpacity style={styles.progressCard} onPress={openProgress}>
              <Ionicons name="play-circle-outline" size={22} color={colors.accent} />
              <View style={styles.progressCopy}>
                <Text style={styles.progressLabel}>Your progress</Text>
                <Text style={styles.progressValue}>
                  {progress
                    ? `Season ${progress.season} · Episode ${progress.episode}`
                    : "Not started"}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>

            <ProgressModal
              visible={progressOpen}
              title={title}
              seasons={getAiredSeasons(details)}
              lastAired={
                details.last_episode_to_air
                  ? {
                      season: details.last_episode_to_air.season_number,
                      episode: details.last_episode_to_air.episode_number,
                    }
                  : null
              }
              initial={progress ?? null}
              onClose={() => setProgressOpen(false)}
              onSave={saveProgress}
              onRemove={removeProgress}
            />
          </>
        ) : null}

        {details.tagline ? <Text style={styles.tagline}>{details.tagline}</Text> : null}

        <View style={styles.stats}>
          <View style={styles.stat}>
            <Ionicons name="star" size={18} color={colors.accent} />
            <Text style={styles.statValue}>
              {details.vote_average ? details.vote_average.toFixed(1) : "-"}
            </Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="people" size={18} color={colors.accent} />
            <Text style={styles.statValue}>
              {userRating.average ? `${userRating.average.toFixed(1)}/5` : "-"}
            </Text>
            <Text style={styles.statLabel}>
              {userRating.count} {userRating.count === 1 ? "review" : "reviews"}
            </Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{details.original_language?.toUpperCase() ?? "-"}</Text>
            <Text style={styles.statLabel}>Language</Text>
          </View>
          {details.number_of_seasons ? (
            <View style={styles.stat}>
              <Text style={styles.statValue}>{details.number_of_seasons}</Text>
              <Text style={styles.statLabel}>Seasons</Text>
            </View>
          ) : null}
        </View>

        <Text style={styles.sectionTitle}>Overview</Text>
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

        {error ? <Text style={styles.error}>{error}</Text> : null}
        {!error && details === result ? (
          <ActivityIndicator color={colors.accent} style={styles.loader} />
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 32 },
  poster: {
    width: "100%",
    height: 360,
    borderRadius: 12,
    backgroundColor: colors.surface,
  },
  posterPlaceholder: { alignItems: "center", justifyContent: "center" },
  title: { color: colors.text, fontSize: 28, fontWeight: "700", marginTop: 20 },
  meta: { color: colors.accent, fontSize: 14, marginTop: 6 },
  tagline: { color: colors.textMuted, fontSize: 15, fontStyle: "italic", marginTop: 16 },
  stats: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: 10,
    justifyContent: "space-around",
    marginTop: 20,
    paddingVertical: 14,
  },
  stat: { alignItems: "center", minWidth: 72 },
  statValue: { color: colors.text, fontSize: 16, fontWeight: "700", marginTop: 4 },
  statLabel: { color: colors.textMuted, fontSize: 12, marginTop: 3 },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: "700", marginTop: 24 },
  overview: { color: colors.textMuted, fontSize: 15, lineHeight: 22, marginTop: 8 },
  genreRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 18 },
  genre: { backgroundColor: colors.border, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 6 },
  genreText: { color: colors.text, fontSize: 12 },
  error: { color: colors.textMuted, fontSize: 13, marginTop: 20 },
  loader: { marginTop: 20 },
  watchlistButton: {
    backgroundColor: colors.accent,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
    marginTop: 14,
  },
  watchlistButtonActive: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  reviewButton: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
    marginTop: 10,
  },
  watchlistButtonText: { color: colors.text, fontSize: 15, fontWeight: "600" },
  progressCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
  },
  progressCopy: { flex: 1 },
  progressLabel: { color: colors.textMuted, fontSize: 12 },
  progressValue: { color: colors.text, fontSize: 15, fontWeight: "600", marginTop: 2 },
});