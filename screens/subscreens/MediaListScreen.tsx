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
  getTmdbList,
  TmdbMediaResult,
} from "../../services/tmdb";
import type { NewSeason } from "../../services/seriesProgress";
import { useNewSeasons } from "../../hooks/useNewSeasons";
import { useFriendsActivity } from "../../hooks/useFriendsActivity";
import { Review, reviewToMedia } from "../../services/reviews";
import type { RootStackParamList } from "../../navigation/types";
import { colors } from "../../theme/colors";

// One screen used for both the Films tab and the Series tab.
// The only differences are given as props.
type Props = {
  mediaType: TmdbMediaResult["media_type"];
  newList: "now_playing" | "on_the_air"; // TMDB list for the second section
  newListTitle: string; // title of the second section
};

export default function MediaListScreen({
  mediaType,
  newList,
  newListTitle,
}: Props) {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  // Word used in the texts: "films" or "series"
  const label = mediaType === "movie" ? "films" : "series";
  const [popularMedia, setPopularMedia] = useState<TmdbMediaResult[]>([]);
  const [newMedia, setNewMedia] = useState<TmdbMediaResult[]>([]);
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Series the user follows that got a new season (empty on the Films tab).
  const newSeasons = useNewSeasons(mediaType === "tv");
  // Latest reviews of the people the user follows, only films or only series.
  const { activity } = useFriendsActivity();
  const friendReviews = activity
    .filter((review) => review.mediaKey.startsWith(`${mediaType}-`))
    .slice(0, 10);

  useEffect(() => {
    const controller = new AbortController();

    Promise.all([
      getTmdbList(mediaType, "top_rated", controller.signal),
      getTmdbList(mediaType, newList, controller.signal),
    ])
      .then(([popular, recent]) => {
        setPopularMedia(popular);
        setNewMedia(recent);
        setError(null);
      })
      .catch((requestError: Error) => {
        if (requestError.name !== "AbortError") {
          setError(requestError.message || `Could not load ${label}.`);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [mediaType, newList, label]);

  const renderMedia = (media: TmdbMediaResult) => {
    // Movies use "title", series use "name"
    const title = media.title ?? media.name ?? "Untitled";
    const posterUrl = getTmdbImageUrl(media.poster_path, "w342");

    return (
      <Pressable
        key={media.id}
        style={({ pressed }) => [styles.card, pressed && styles.pressed]}
        onPress={() => navigation.navigate("MovieDetails", { result: media })}
        accessibilityRole="button"
        accessibilityLabel={`Open details for ${title}`}
      >
        {posterUrl ? (
          <Image source={{ uri: posterUrl }} style={styles.poster} />
        ) : (
          <View style={[styles.poster, styles.posterPlaceholder]}>
            <Ionicons
              name={mediaType === "movie" ? "film-outline" : "tv-outline"}
              size={28}
              color={colors.textMuted}
            />
          </View>
        )}
        <Text style={styles.cardTitle} numberOfLines={2}>
          {title}
        </Text>
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={12} color={colors.accent} />
          <Text style={styles.rating}>
            {media.vote_average ? media.vote_average.toFixed(1) : "-"}
          </Text>
        </View>
      </Pressable>
    );
  };

  // Card of a series with a new season: shows the new season and where the user stopped.
  const renderNewSeason = ({ progress, newSeason }: NewSeason) => {
    const media = progress.media;
    const posterUrl = getTmdbImageUrl(media.poster_path, "w342");
    const title = media.title ?? media.name ?? "Untitled";

    return (
      <Pressable
        key={media.id}
        style={({ pressed }) => [styles.card, pressed && styles.pressed]}
        onPress={() => navigation.navigate("MovieDetails", { result: media })}
        accessibilityRole="button"
        accessibilityLabel={`Season ${newSeason} of ${title} is out`}
      >
        <View>
          {posterUrl ? (
            <Image source={{ uri: posterUrl }} style={styles.poster} />
          ) : (
            <View style={[styles.poster, styles.posterPlaceholder]}>
              <Ionicons name="tv-outline" size={28} color={colors.textMuted} />
            </View>
          )}
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Season {newSeason}</Text>
          </View>
        </View>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {title}
        </Text>
        <Text style={styles.rating}>
          You stopped at S{progress.season} · E{progress.episode}
        </Text>
      </Pressable>
    );
  };

  // Card of a friend's review: poster with the rating, title and who reviewed it.
  const renderFriendReview = (review: Review) => {
    const posterUrl = getTmdbImageUrl(review.poster_path, "w342");

    return (
      <Pressable
        key={`${review.uid}-${review.mediaKey}-${review.createdAt}`}
        style={({ pressed }) => [styles.card, pressed && styles.pressed]}
        onPress={() =>
          navigation.navigate("MovieDetails", { result: reviewToMedia(review) })
        }
        accessibilityRole="button"
        accessibilityLabel={`${review.username} rated ${review.title} ${review.rating} out of 5`}
      >
        <View>
          {posterUrl ? (
            <Image source={{ uri: posterUrl }} style={styles.poster} />
          ) : (
            <View style={[styles.poster, styles.posterPlaceholder]}>
              <Ionicons
                name={mediaType === "movie" ? "film-outline" : "tv-outline"}
                size={28}
                color={colors.textMuted}
              />
            </View>
          )}
          <View style={styles.badge}>
            <Ionicons name="star" size={10} color={colors.text} />
            <Text style={styles.badgeText}> {review.rating}</Text>
          </View>
        </View>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {review.title}
        </Text>
        <Text style={styles.friendName} numberOfLines={1}>
          by {review.username}
        </Text>
      </Pressable>
    );
  };

  const renderSection = (
    title: string,
    list: TmdbMediaResult[],
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
        <View style={styles.grid}>{list.map(renderMedia)}</View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.row}
        >
          {list.slice(0, 6).map(renderMedia)}
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
      {newSeasons.length > 0 ? (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>New seasons for you</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.row}
          >
            {newSeasons.map(renderNewSeason)}
          </ScrollView>
        </View>
      ) : null}

      {isLoading ? (
        <View style={styles.status}>
          <ActivityIndicator color={colors.accent} />
          <Text style={styles.statusText}>Finding {label} for you...</Text>
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
          {renderSection("Popular with viewers", popularMedia, "See all")}
          {renderSection(newListTitle, newMedia, "See all")}
        </>
      )}

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Friend pulse</Text>
          <Pressable
            // "Friends" is a bottom tab: the navigation finds it from here.
            onPress={() => (navigation as any).navigate("Friends")}
            accessibilityRole="button"
            hitSlop={8}
          >
            <Text style={styles.sectionAction}>See all</Text>
          </Pressable>
        </View>
        {friendReviews.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.row}
          >
            {friendReviews.map(renderFriendReview)}
          </ScrollView>
        ) : (
          <View style={styles.friendEmptyState}>
            <View style={styles.friendIcon}>
              <Ionicons name="people-outline" size={24} color={colors.accent} />
            </View>
            <View style={styles.friendCopy}>
              <Text style={styles.friendTitle}>
                Your friends&apos; {label} will appear here
              </Text>
              <Text style={styles.friendText}>
                Follow friends and their recent reviews will show up in this feed.
              </Text>
            </View>
          </View>
        )}
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
  card: { width: 124 },
  pressed: { opacity: 0.72 },
  poster: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    height: 184,
    width: 124,
  },
  posterPlaceholder: { alignItems: "center", justifyContent: "center" },
  cardTitle: {
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
  badge: {
    flexDirection: "row",
    alignItems: "center",
    position: "absolute",
    top: 6,
    left: 6,
    backgroundColor: colors.accent,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  badgeText: { color: colors.text, fontSize: 11, fontWeight: "700" },
  friendName: { color: colors.accent, fontSize: 12, fontWeight: "600", marginTop: 4 },
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
