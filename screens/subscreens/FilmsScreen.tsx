import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import {
  getTmdbImageUrl,
  getTmdbMovieList,
  TmdbMediaResult,
} from "../../services/tmdb";
import type { RootStackParamList } from "../../navigation/types";
import { colors } from "../../theme/colors";

export default function FilmsScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [popularMovies, setPopularMovies] = useState<TmdbMediaResult[]>([]);
  const [newMovies, setNewMovies] = useState<TmdbMediaResult[]>([]);
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    Promise.all([
      getTmdbMovieList("top_rated", controller.signal),
      getTmdbMovieList("now_playing", controller.signal),
    ])
      .then(([popular, recent]) => {
        setPopularMovies(popular);
        setNewMovies(recent);
        setError(null);
      })
      .catch((requestError: Error) => {
        if (requestError.name !== "AbortError") {
          setError(requestError.message || "Could not load movies.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, []);

  const renderMovie = (movie: TmdbMediaResult) => {
    const title = movie.title ?? "Untitled";
    const posterUrl = getTmdbImageUrl(movie.poster_path, "w342");

    return (
      <Pressable
        key={movie.id}
        style={({ pressed }) => [styles.movieCard, pressed && styles.pressed]}
        onPress={() => navigation.navigate("MovieDetails", { result: movie })}
        accessibilityRole="button"
        accessibilityLabel={`Open details for ${title}`}
      >
        {posterUrl ? (
          <Image source={{ uri: posterUrl }} style={styles.poster} />
        ) : (
          <View style={[styles.poster, styles.posterPlaceholder]}>
            <Ionicons name="film-outline" size={28} color={colors.textMuted} />
          </View>
        )}
        <Text style={styles.movieTitle} numberOfLines={2}>
          {title}
        </Text>
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={12} color={colors.accent} />
          <Text style={styles.rating}>
            {movie.vote_average ? movie.vote_average.toFixed(1) : "-"}
          </Text>
        </View>
      </Pressable>
    );
  };

  const renderSection = (
    title: string,
    movies: TmdbMediaResult[],
    actionLabel: string,
  ) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Pressable
          onPress={() =>
            setExpandedSections((current) => ({
              ...current,
              [title]: !current[title],
            }))
          }
          accessibilityRole="button"
          accessibilityLabel={`${expandedSections[title] ? "Show fewer" : actionLabel} ${title.toLowerCase()}`}
          hitSlop={8}
        >
          <Text style={styles.sectionAction}>
            {expandedSections[title] ? "Show less" : actionLabel}
          </Text>
        </Pressable>
      </View>
      {expandedSections[title] ? (
        <View style={styles.grid}>{movies.map(renderMovie)}</View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.row}
        >
          {movies.slice(0, 6).map(renderMovie)}
        </ScrollView>
      )}
    </View>
  );

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {isLoading ? (
        <View style={styles.status}>
          <ActivityIndicator color={colors.accent} />
          <Text style={styles.statusText}>Finding films for you...</Text>
        </View>
      ) : error ? (
        <View style={styles.status}>
          <Ionicons
            name="cloud-offline-outline"
            size={28}
            color={colors.textMuted}
          />
          <Text style={styles.statusText}>{error}</Text>
        </View>
      ) : (
        <>
          {renderSection("Popular with viewers", popularMovies, "See all")}
          {renderSection("New releases", newMovies, "See all")}
        </>
      )}

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Friend pulse</Text>
          <Text style={styles.sectionAction}>Activity</Text>
        </View>
        <View style={styles.friendEmptyState}>
          <View style={styles.friendIcon}>
            <Ionicons name="people-outline" size={24} color={colors.accent} />
          </View>
          <View style={styles.friendCopy}>
            <Text style={styles.friendTitle}>
              Your friends&apos; films will appear here
            </Text>
            <Text style={styles.friendText}>
              Follow friends and their recent watches will show up in this feed.
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingTop: 18, paddingBottom: 28 },
  section: { marginBottom: 24 },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: "700" },
  sectionAction: { color: colors.accent, fontSize: 12, fontWeight: "600" },
  row: { gap: 12, paddingHorizontal: 16 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    paddingHorizontal: 16,
  },
  movieCard: { width: 124 },
  pressed: { opacity: 0.72 },
  poster: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    height: 184,
    width: 124,
  },
  posterPlaceholder: { alignItems: "center", justifyContent: "center" },
  movieTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 17,
    marginTop: 8,
  },
  ratingRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
    marginTop: 5,
  },
  rating: { color: colors.textMuted, fontSize: 12 },
  status: {
    alignItems: "center",
    gap: 10,
    minHeight: 230,
    justifyContent: "center",
  },
  statusText: { color: colors.textMuted, fontSize: 14, textAlign: "center" },
  friendEmptyState: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 10,
    flexDirection: "row",
    marginHorizontal: 16,
    padding: 14,
  },
  friendIcon: {
    alignItems: "center",
    backgroundColor: colors.border,
    borderRadius: 24,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  friendCopy: { flex: 1, marginLeft: 12 },
  friendTitle: { color: colors.text, fontSize: 14, fontWeight: "700" },
  friendText: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
  },
});
