// Details page of a movie or series.
// The parts of the page are in components/details/, and what the user can do
// (watchlist, stars, watched, review) is in hooks/useTitleActions.

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
  getTrailer,
  TmdbMediaDetails,
} from "../services/tmdb";
import { useAuth } from "../hooks/useAuth";
import { useTitleActions } from "../hooks/useTitleActions";
import ReviewModal from "../components/ReviewModal";
import RatingBox from "../components/details/RatingBox";
import SeriesProgressCard from "../components/details/SeriesProgressCard";
import StatsRow from "../components/details/StatsRow";
import OverviewSection from "../components/details/OverviewSection";
import TrailerSection from "../components/details/TrailerSection";
import type { RootStackParamList } from "../navigation/types";
import { colors } from "../theme/colors";

type Props = NativeStackScreenProps<RootStackParamList, "MovieDetails">;

export default function MovieDetailsScreen({ route, navigation }: Props) {
  const { result } = route.params;
  // Starts with the little data from the previous page, then the full TMDB data.
  const [details, setDetails] = useState<TmdbMediaDetails>(result);
  const [error, setError] = useState<string | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const { user } = useAuth();

  const goToLogin = () => navigation.navigate("Login");
  const actions = useTitleActions(result, details, user, goToLogin);

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
  const trailer = getTrailer(details);
  const shownError = actions.error ?? error;

  const openReview = () => {
    if (!user) return goToLogin();
    setReviewOpen(true);
  };

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
          style={[
            styles.watchlistButton,
            actions.inWatchlist && styles.watchlistButtonActive,
          ]}
          onPress={actions.toggleWatchlist}
        >
          <Text style={styles.buttonText}>
            {actions.inWatchlist ? "- Watchlist" : "+ Watchlist"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.reviewButton} onPress={openReview}>
          <Text style={styles.buttonText}>Review</Text>
        </TouchableOpacity>

        <RatingBox
          rating={actions.myRating}
          isWatched={actions.isWatched}
          canUnrate={actions.canUnrate}
          onRate={actions.rate}
          onUnrate={actions.unrate}
          onToggleWatched={actions.toggleWatched}
        />

        <ReviewModal
          visible={reviewOpen}
          title={title}
          onClose={() => setReviewOpen(false)}
          onSubmit={(rating, comment, watchedDate) => {
            setReviewOpen(false);
            actions.submitReview(rating, comment, watchedDate);
          }}
        />

        {result.media_type === "tv" ? (
          <SeriesProgressCard
            media={result}
            details={details}
            user={user}
            onLoginNeeded={goToLogin}
            onError={setError}
          />
        ) : null}

        {details.tagline ? (
          <Text style={styles.tagline}>{details.tagline}</Text>
        ) : null}

        <StatsRow details={details} average={actions.average} />

        <OverviewSection title={title} details={details} />

        {trailer ? <TrailerSection trailer={trailer} title={title} /> : null}

        {shownError ? <Text style={styles.error}>{shownError}</Text> : null}
        {!shownError && details === result ? (
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
  tagline: {
    color: colors.textMuted,
    fontSize: 15,
    fontStyle: "italic",
    marginTop: 16,
  },
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
  buttonText: { color: colors.text, fontSize: 15, fontWeight: "600" },
  error: { color: colors.textMuted, fontSize: 13, marginTop: 20 },
  loader: { marginTop: 20 },
});
