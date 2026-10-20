import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  View,
  Text,
  StyleSheet,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import AppHeader from "../components/AppHeader";
import { colors } from "../theme/colors";
import { useTmdbSearch } from "../hooks/useTmdbSearch";
import {
  getTmdbImageUrl,
  getTmdbTrending,
  TmdbMediaResult,
} from "../services/tmdb";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";

export default function SearchScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [query, setQuery] = useState("");
  const { results, isLoading, error } = useTmdbSearch(query);
  const isSearching = query.trim().length > 0;

  // Shown while the search bar is empty: the most popular titles this week.
  const [trending, setTrending] = useState<TmdbMediaResult[]>([]);
  const [trendingLoading, setTrendingLoading] = useState(true);
  useEffect(() => {
    const controller = new AbortController();
    getTmdbTrending(controller.signal)
      .then(setTrending)
      .catch(() => {})
      .finally(() => {
        if (!controller.signal.aborted) setTrendingLoading(false);
      });
    return () => controller.abort();
  }, []);

  const list = isSearching ? results : trending;
  const loading = isSearching ? isLoading : trendingLoading;

  const renderResult = ({
    item,
    index,
  }: {
    item: TmdbMediaResult;
    index: number;
  }) => {
    const title = item.title ?? item.name ?? "Untitled";
    const date = item.release_date ?? item.first_air_date;
    const imageUrl = getTmdbImageUrl(item.poster_path);

    return (
      <Pressable
        style={({ pressed }) => [styles.resultItem, pressed && styles.pressed]}
        onPress={() => navigation.navigate("MovieDetails", { result: item })}
        accessibilityRole="button"
        accessibilityLabel={`Open details for ${title}`}
      >
        {!isSearching ? (
          // Rank in the trending list (1, 2, 3...).
          <View style={styles.rank}>
            <Text style={styles.rankText}>{index + 1}</Text>
          </View>
        ) : null}
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.poster} />
        ) : (
          <View style={[styles.poster, styles.posterPlaceholder]}>
            <Ionicons name="film-outline" size={24} color={colors.textMuted} />
          </View>
        )}
        <View style={styles.resultDetails}>
          <Text style={styles.resultTitle} numberOfLines={2}>
            {title}
          </Text>
          <View style={styles.metaRow}>
            <View
              style={[
                styles.typeBadge,
                item.media_type === "tv" && styles.typeBadgeSeries,
              ]}
            >
              <Ionicons
                name={
                  item.media_type === "movie" ? "film-outline" : "tv-outline"
                }
                size={12}
                color={colors.text}
              />
              <Text style={styles.typeText}>
                {item.media_type === "movie" ? "Movie" : "Series"}
              </Text>
            </View>
            {date ? (
              <Text style={styles.resultMeta}>{date.slice(0, 4)}</Text>
            ) : null}
          </View>
          {item.overview ? (
            <Text style={styles.overview} numberOfLines={3}>
              {item.overview}
            </Text>
          ) : null}
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <AppHeader />
      <View style={styles.container}>
        <Text style={styles.title}>Search</Text>

        <View style={styles.searchBar}>
          <Ionicons
            name="search"
            size={20}
            color={colors.textMuted}
            style={styles.icon}
          />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search for a movie/series"
            placeholderTextColor={colors.placeholder}
            style={styles.input}
            autoCorrect={false}
          />
        </View>

        <Text style={styles.sectionTitle}>
          {isSearching ? "Results" : "Trending this week"}
        </Text>

        {loading ? (
          <View style={styles.statusContainer}>
            <ActivityIndicator color={colors.accent} />
          </View>
        ) : isSearching && error ? (
          <View style={styles.statusContainer}>
            <Text style={styles.placeholderText}>{error}</Text>
          </View>
        ) : (
          <FlatList
            data={list}
            keyExtractor={(item) => `${item.media_type}-${item.id}`}
            renderItem={renderResult}
            contentContainerStyle={
              list.length === 0 ? styles.emptyList : styles.resultsList
            }
            ListEmptyComponent={
              <Text style={styles.placeholderText}>
                {isSearching
                  ? "No movies or series found"
                  : "Start typing to find a movie or series"}
              </Text>
            }
            keyboardShouldPersistTaps="handled"
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 16,
    marginTop: 8,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
  },
  statusContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    marginTop: 18,
  },
  resultsList: {
    paddingTop: 10,
    paddingBottom: 24,
  },
  emptyList: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 48,
  },
  resultItem: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: 10,
    marginBottom: 12,
    overflow: "hidden",
  },
  pressed: {
    opacity: 0.75,
  },
  poster: {
    width: 74,
    height: 110,
    backgroundColor: colors.border,
  },
  posterPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  resultDetails: {
    flex: 1,
    padding: 12,
  },
  resultTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  rank: {
    width: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  rankText: {
    color: colors.accent,
    fontSize: 20,
    fontWeight: "800",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 6,
  },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.accent,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  // Series get a different color, to tell them apart from movies at a glance.
  typeBadgeSeries: {
    backgroundColor: "#3d6a7a",
  },
  typeText: {
    color: colors.text,
    fontSize: 11,
    fontWeight: "700",
  },
  resultMeta: {
    color: colors.textMuted,
    fontSize: 13,
  },
  overview: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 8,
  },
  placeholderText: {
    color: colors.textMuted,
    fontSize: 14,
  },
});
