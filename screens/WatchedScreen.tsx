import { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
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

  useEffect(() => subscribeToUserRatings(uid, setRatings), [uid]);

  const list =
    filter === "all"
      ? ratings
      : ratings.filter((rating) => rating.mediaKey.startsWith(`${filter}-`));

  return (
    <View style={styles.container}>
      <View style={styles.filterRow}>
        {filters.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[styles.filterButton, filter === option.value && styles.filterButtonActive]}
            onPress={() => setFilter(option.value)}
          >
            <Text style={styles.filterText}>{option.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={list}
        numColumns={3}
        keyExtractor={(item) => item.mediaKey}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>Nothing watched yet.</Text>}
        renderItem={({ item }) => {
          const imageUrl = getTmdbImageUrl(item.poster_path, "w342");
          return (
            <Pressable
              style={({ pressed }) => [styles.item, pressed && styles.pressed]}
              onPress={() =>
                navigation.navigate("MovieDetails", { result: ratingToMedia(item) })
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
