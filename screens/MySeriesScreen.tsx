import { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  SeriesProgress,
  SeriesProgressMap,
  subscribeToSeriesProgress,
} from "../services/seriesProgress";
import { getTmdbImageUrl } from "../services/tmdb";
import type { RootStackParamList } from "../navigation/types";
import { colors } from "../theme/colors";

type Props = NativeStackScreenProps<RootStackParamList, "MySeries">;

// The buttons at the top of the page.
// "lastWatched" and "newest" change the order, "finished" keeps only finished series.
type Sort = "lastWatched" | "newest" | "finished";

const sorts: { value: Sort; label: string }[] = [
  { value: "lastWatched", label: "Last watched" },
  { value: "newest", label: "Most recent" },
  { value: "finished", label: "Finished" },
];

// All the series a user has started, with where they stopped.
// route.params.uid says whose series to show.
export default function MySeriesScreen({ route, navigation }: Props) {
  const { uid } = route.params;
  const [progress, setProgress] = useState<SeriesProgressMap>({});
  const [sort, setSort] = useState<Sort>("lastWatched");

  useEffect(() => subscribeToSeriesProgress(uid, setProgress), [uid]);

  let series = Object.values(progress);
  if (sort === "finished") {
    series = series.filter((item) => item.finished);
  }
  if (sort === "newest") {
    // Newest series first (by release date, "2024-05-01" strings sort correctly).
    series.sort((a, b) =>
      (b.media.release_date ?? "").localeCompare(a.media.release_date ?? ""),
    );
  } else {
    // Last updated progress first.
    series.sort((a, b) => b.updatedAt - a.updatedAt);
  }

  const renderItem = ({ item }: { item: SeriesProgress }) => {
    const imageUrl = getTmdbImageUrl(item.media.poster_path, "w185");
    const year = item.media.release_date?.slice(0, 4);

    return (
      <Pressable
        style={({ pressed }) => [styles.item, pressed && styles.pressed]}
        onPress={() => navigation.navigate("MovieDetails", { result: item.media })}
      >
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.poster} />
        ) : (
          <View style={[styles.poster, styles.noPoster]}>
            <Ionicons name="tv-outline" size={22} color={colors.textMuted} />
          </View>
        )}

        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={2}>
            {item.media.title}
          </Text>
          {year ? <Text style={styles.year}>{year}</Text> : null}

          <Text style={styles.progress}>
            Season {item.season} · Episode {item.episode}
          </Text>

          <View style={[styles.status, item.finished && styles.statusFinished]}>
            <Ionicons
              name={item.finished ? "checkmark-circle" : "play-circle-outline"}
              size={14}
              color={colors.text}
            />
            <Text style={styles.statusText}>
              {item.finished ? "Finished" : "In progress"}
            </Text>
          </View>

          <Text style={styles.date}>
            Last watched {new Date(item.updatedAt).toLocaleDateString()}
          </Text>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.sortRow}>
        {sorts.map((option) => (
          <Pressable
            key={option.value}
            style={[styles.sortButton, sort === option.value && styles.sortButtonActive]}
            onPress={() => setSort(option.value)}
          >
            <Text style={styles.sortText}>{option.label}</Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={series}
        keyExtractor={(item) => `${item.media.id}`}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {sort === "finished" ? "No finished series yet." : "No series started yet."}
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  sortRow: {
    flexDirection: "row",
    gap: 8,
    marginHorizontal: 16,
    marginVertical: 12,
  },
  sortButton: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  sortButtonActive: {
    backgroundColor: colors.accent,
  },
  sortText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "600",
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  item: {
    flexDirection: "row",
    gap: 14,
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  pressed: {
    opacity: 0.75,
  },
  poster: {
    width: 80,
    aspectRatio: 2 / 3,
    borderRadius: 6,
    backgroundColor: colors.border,
  },
  noPoster: {
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  year: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  progress: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "600",
    marginTop: 10,
  },
  status: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 4,
    backgroundColor: colors.border,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 8,
  },
  statusFinished: {
    backgroundColor: colors.accent,
  },
  statusText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "600",
  },
  date: {
    color: colors.placeholder,
    fontSize: 11,
    marginTop: 8,
  },
  empty: {
    color: colors.textMuted,
    fontSize: 15,
    textAlign: "center",
    marginTop: 20,
  },
});
