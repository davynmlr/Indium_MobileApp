import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { colors } from "../theme/colors";
import { getTmdbImageUrl, searchTmdb, TmdbMediaResult } from "../services/tmdb";

type Props = {
  visible: boolean;
  mediaType: TmdbMediaResult["media_type"];
  onClose: () => void;
  onSelect: (movie: TmdbMediaResult) => void;
};

export default function MoviePickerModal({
  visible,
  mediaType,
  onClose,
  onSelect,
}: Props) {
  const label = mediaType === "movie" ? "movie" : "series";
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TmdbMediaResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) setQuery("");
  }, [visible]);

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
        setResults(nextResults.filter((result) => result.media_type === mediaType));
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
  }, [query, mediaType]);

  const renderResult = ({ item }: { item: TmdbMediaResult }) => {
    const title = item.title ?? item.name ?? "Untitled";
    const date = item.release_date ?? item.first_air_date;
    const imageUrl = getTmdbImageUrl(item.poster_path);

    return (
      <Pressable
        style={({ pressed }) => [styles.resultItem, pressed && styles.pressed]}
        onPress={() => onSelect(item)}
        accessibilityRole="button"
        accessibilityLabel={`Choose ${title}`}
      >
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.poster} />
        ) : (
          <View style={[styles.poster, styles.posterPlaceholder]}>
            <Ionicons name="film-outline" size={20} color={colors.textMuted} />
          </View>
        )}
        <View style={styles.resultDetails}>
          <Text style={styles.resultTitle} numberOfLines={2}>
            {title}
          </Text>
          {date ? (
            <Text style={styles.resultMeta}>{date.slice(0, 4)}</Text>
          ) : null}
        </View>
      </Pressable>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Choose a {label}</Text>
            <Pressable
              onPress={onClose}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <Ionicons name="close" size={26} color={colors.text} />
            </Pressable>
          </View>

          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color={colors.textMuted} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={`Search for a ${label}`}
              placeholderTextColor={colors.placeholder}
              style={styles.input}
              autoCorrect={false}
              autoFocus
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
                    ? `No ${mediaType === "movie" ? "movies" : "series"} found`
                    : `Start typing to find a ${label}`}
                </Text>
              }
              keyboardShouldPersistTaps="handled"
            />
          )}
        </View>
      </SafeAreaView>
    </Modal>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    marginTop: 8,
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "700",
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
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 10,
    marginBottom: 10,
    overflow: "hidden",
  },
  pressed: {
    opacity: 0.75,
  },
  poster: {
    width: 50,
    height: 75,
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
    fontSize: 15,
    fontWeight: "700",
  },
  resultMeta: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 4,
  },
  placeholderText: {
    color: colors.textMuted,
    fontSize: 14,
  },
});
