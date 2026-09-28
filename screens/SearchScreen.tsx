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
import { colors } from "../theme/colors";
import { getTmdbImageUrl, searchTmdb, TmdbMediaResult } from "../services/tmdb";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";

export default function SearchScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TmdbMediaResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setResults([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      setIsLoading(true);
      setError(null);

      try {
        const nextResults = await searchTmdb(trimmedQuery, controller.signal);
        setResults(nextResults);
      } catch (requestError) {
        if ((requestError as Error).name !== "AbortError") {
          setResults([]);
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Could not load results.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }, 350);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [query]);

  const renderResult = ({ item }: { item: TmdbMediaResult }) => {
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
          <Text style={styles.resultMeta}>
            {item.media_type === "movie" ? "Movie" : "Series"}
            {date ? ` · ${date.slice(0, 4)}` : ""}
          </Text>
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

        {isLoading ? (
          <View style={styles.statusContainer}>
            <ActivityIndicator color={colors.accent} />
          </View>
        ) : error ? (
          <View style={styles.statusContainer}>
            <Text style={styles.placeholderText}>{error}</Text>
          </View>
        ) : (
          <FlatList
            data={results}
            keyExtractor={(item) => `${item.media_type}-${item.id}`}
            renderItem={renderResult}
            contentContainerStyle={
              results.length === 0 ? styles.emptyList : styles.resultsList
            }
            ListEmptyComponent={
              <Text style={styles.placeholderText}>
                {query.trim()
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
  resultsList: {
    paddingTop: 16,
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
  resultMeta: {
    color: colors.accent,
    fontSize: 13,
    marginTop: 5,
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
