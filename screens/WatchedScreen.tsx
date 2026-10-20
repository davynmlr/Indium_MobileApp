import { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Rating, subscribeToUserRatings } from "../services/ratings";
import { getStarIcon } from "../services/reviews";
import { getTmdbImageUrl, TmdbMediaResult } from "../services/tmdb";
import type { RootStackParamList } from "../navigation/types";
import { colors } from "../theme/colors";

type Props = NativeStackScreenProps<RootStackParamList, "Watched">;

const filters = [
  { value: "all", label: "All" },
  { value: "movie", label: "Movies" },
  { value: "tv", label: "Series" },
] as const;

// Rating filter: null = any rating, 0 = watched without rating, else 0.5 to 5.
const ratingFilters: (number | null)[] = [
  null,
  0.5,
  1,
  1.5,
  2,
  2.5,
  3,
  3.5,
  4,
  4.5,
  5,
  0,
];

// Turns a rating back into a movie/series, to open its details page.
// mediaKey looks like "movie-123", so we split it to get the type and the id.
const ratingToMedia = (rating: Rating): TmdbMediaResult => {
  const [mediaType, id] = rating.mediaKey.split("-");
  return {
    id: Number(id),
    media_type: mediaType as TmdbMediaResult["media_type"],
    title: rating.title,
    poster_path: rating.poster_path,
    overview: "",
  };
};

// Everything a user has watched (rated or reviewed), with their rating.
// route.params.uid says whose list to show.
export default function WatchedScreen({ route, navigation }: Props) {
  const { uid } = route.params;
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [filter, setFilter] = useState<"all" | "movie" | "tv">("all");
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);

  useEffect(() => subscribeToUserRatings(uid, setRatings), [uid]);

  const list = ratings.filter(
    (rating) =>
      (filter === "all" || rating.mediaKey.startsWith(`${filter}-`)) &&
      (ratingFilter === null || rating.rating === ratingFilter),
  );

  return (
    <View style={styles.container}>
      <View style={styles.filterRow}>
        {filters.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.filterButton,
              filter === option.value && styles.filterButtonActive,
            ]}
            onPress={() => setFilter(option.value)}
          >
            <Text style={styles.filterText}>{option.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.ratingScroll}
        contentContainerStyle={styles.ratingRow}
      >
        {ratingFilters.map((value) => {
          const active = ratingFilter === value;
          return (
            <TouchableOpacity
              key={String(value)}
              style={[
                styles.filterButton,
                styles.ratingButton,
                active && styles.filterButtonActive,
              ]}
              onPress={() => setRatingFilter(value)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={
                value === null
                  ? "Any rating"
                  : value === 0
                    ? "Not rated"
                    : `Rated ${value} stars`
              }
            >
              {value === null ? (
                <Text style={styles.filterText}>Any rating</Text>
              ) : value === 0 ? (
                <>
                  <Ionicons name="eye" size={12} color={colors.text} />
                  <Text style={styles.filterText}>No rating</Text>
                </>
              ) : (
                <>
                  <Ionicons
                    name="star"
                    size={12}
                    color={active ? colors.text : colors.accent}
                  />
                  <Text style={styles.filterText}>{value}</Text>
                </>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <FlatList
        data={list}
        numColumns={3}
        keyExtractor={(item) => item.mediaKey}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {ratings.length === 0
              ? "Nothing watched yet."
              : "Nothing matches this filter."}
          </Text>
        }
        renderItem={({ item }) => {
          const imageUrl = getTmdbImageUrl(item.poster_path, "w342");
          return (
            <Pressable
              style={({ pressed }) => [styles.item, pressed && styles.pressed]}
              onPress={() =>
                navigation.navigate("MovieDetails", {
                  result: ratingToMedia(item),
                })
              }
            >
              {imageUrl ? (
                <Image source={{ uri: imageUrl }} style={styles.poster} />
              ) : (
                <View style={[styles.poster, styles.noPoster]}>
                  <Text style={styles.noPosterText} numberOfLines={3}>
                    {item.title}
                  </Text>
                </View>
              )}
              {item.rating > 0 ? (
                <View style={styles.stars}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons
                      key={star}
                      name={getStarIcon(item.rating, star)}
                      size={12}
                      color={colors.accent}
                    />
                  ))}
                </View>
              ) : (
                // Watched without a rating: just an eye.
                <View style={styles.stars}>
                  <Ionicons name="eye" size={12} color={colors.textMuted} />
                </View>
              )}
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    marginHorizontal: 12,
    marginVertical: 12,
  },
  filterButton: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  filterButtonActive: { backgroundColor: colors.accent },
  ratingScroll: { flexGrow: 0, marginBottom: 12 },
  ratingRow: { gap: 8, paddingHorizontal: 12 },
  ratingButton: { flexDirection: "row", alignItems: "center", gap: 4 },
  filterText: { color: colors.text, fontSize: 13, fontWeight: "600" },
  list: { paddingHorizontal: 8, paddingBottom: 16 },
  // Each item takes 1/3 of the width, so we get 3 per line.
  item: { width: "33.33%", padding: 4, marginBottom: 6 },
  pressed: { opacity: 0.75 },
  poster: {
    width: "100%",
    aspectRatio: 2 / 3,
    borderRadius: 6,
    backgroundColor: colors.surface,
  },
  noPoster: { alignItems: "center", justifyContent: "center", padding: 4 },
  noPosterText: { color: colors.textMuted, fontSize: 11, textAlign: "center" },
  stars: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 1,
    marginTop: 4,
  },
  empty: {
    color: colors.textMuted,
    fontSize: 15,
    textAlign: "center",
    marginTop: 20,
  },
});
