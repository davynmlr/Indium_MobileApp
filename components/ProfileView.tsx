// The content of a profile page: name, followers/following, links,
// favorites and recent activity.
// Used for the logged-in user's own profile (editable favorites)
// and for other users' profiles (read only).

import { ReactNode, useEffect, useState } from "react";
import {
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
import MoviePickerModal from "./MoviePickerModal";
import ReviewItem from "./ReviewItem";
import {
  Review,
  reviewToMedia,
  subscribeToUserReviews,
} from "../services/reviews";
import {
  emptyFavorites,
  Favorites,
  FavoriteType,
  saveFavorites,
  subscribeToFavorites,
} from "../services/favorites";
import {
  subscribeToFollowers,
  subscribeToFollowing,
} from "../services/follows";
import {
  getTmdbImageUrl,
  toSavedMedia,
  TmdbMediaResult,
} from "../services/tmdb";
import type { RootStackParamList } from "../navigation/types";
import { colors } from "../theme/colors";

type Props = {
  uid: string;
  name: string;
  subtitle?: string | null; // small text under the name (email on your own profile)
  photoURL?: string | null;
  isOwnProfile: boolean; // true = favorites can be edited
  headerRight?: ReactNode; // for example the settings button
  actions?: ReactNode; // for example the Follow button
};

export default function ProfileView({
  uid,
  name,
  subtitle,
  photoURL,
  isOwnProfile,
  headerRight,
  actions,
}: Props) {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [favorites, setFavorites] = useState<Record<FavoriteType, Favorites>>({
    movie: emptyFavorites(),
    tv: emptyFavorites(),
  });
  const [favoritesError, setFavoritesError] = useState("");
  // Favorite slot being filled, null when the picker is closed.
  const [pickingSlot, setPickingSlot] = useState<{
    type: FavoriteType;
    index: number;
  } | null>(null);
  // The user's reviews, newest first (we show the last 3 in "Recent activity").
  const [reviews, setReviews] = useState<Review[]>([]);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  useEffect(
    () =>
      subscribeToFavorites(uid, setFavorites, () =>
        setFavoritesError("Could not load the favorites."),
      ),
    [uid],
  );
  useEffect(() => subscribeToUserReviews(uid, setReviews), [uid]);
  useEffect(
    () => subscribeToFollowers(uid, (users) => setFollowersCount(users.length)),
    [uid],
  );
  useEffect(
    () => subscribeToFollowing(uid, (users) => setFollowingCount(users.length)),
    [uid],
  );

  // Buttons that open a page with this user's data.
  const links = [
    { label: "Diary", icon: "book-outline", open: () => navigation.navigate("Diary", { uid }) },
    { label: "Watchlist", icon: "bookmark-outline", open: () => navigation.navigate("UserWatchlist", { uid }) },
    { label: isOwnProfile ? "My series" : "Series", icon: "tv-outline", open: () => navigation.navigate("MySeries", { uid }) },
    { label: "Watched", icon: "eye-outline", open: () => navigation.navigate("Watched", { uid }) },
  ] as const;

  const updateSlot = async (
    type: FavoriteType,
    index: number,
    media: TmdbMediaResult | null,
  ) => {
    const next = favorites[type].map((favorite, i) =>
      i === index ? media : favorite,
    );
    setFavoritesError("");
    try {
      await saveFavorites(uid, type, next);
    } catch {
      setFavoritesError("Could not save your favorites.");
    }
  };

  const handleSelect = (media: TmdbMediaResult) => {
    if (pickingSlot !== null) {
      updateSlot(pickingSlot.type, pickingSlot.index, toSavedMedia(media));
    }
    setPickingSlot(null);
  };

  const renderFavorites = (type: FavoriteType) => (
    <View style={styles.favoritesRow}>
      {favorites[type].map((favorite, index) => {
        const imageUrl = favorite
          ? getTmdbImageUrl(favorite.poster_path, "w342")
          : null;

        if (!favorite) {
          // Other people's empty slots are just empty boxes.
          if (!isOwnProfile) {
            return (
              <View key={index} style={[styles.favoriteSlot, styles.emptySlot]} />
            );
          }
          return (
            <Pressable
              key={index}
              style={({ pressed }) => [
                styles.favoriteSlot,
                styles.emptySlot,
                pressed && styles.pressed,
              ]}
              onPress={() => setPickingSlot({ type, index })}
              accessibilityRole="button"
              accessibilityLabel={
                type === "movie"
                  ? "Add a favorite movie"
                  : "Add a favorite series"
              }
            >
              <Ionicons name="add" size={30} color={colors.textMuted} />
            </Pressable>
          );
        }

        return (
          <View key={index} style={styles.favoriteSlot}>
            <Pressable
              style={({ pressed }) => [
                styles.favoritePoster,
                pressed && styles.pressed,
              ]}
              onPress={() =>
                navigation.navigate("MovieDetails", { result: favorite })
              }
              accessibilityRole="button"
              accessibilityLabel={`Open details for ${favorite.title}`}
            >
              {imageUrl ? (
                <Image source={{ uri: imageUrl }} style={styles.posterImage} />
              ) : (
                <Text style={styles.posterTitle} numberOfLines={4}>
                  {favorite.title}
                </Text>
              )}
            </Pressable>
            {isOwnProfile ? (
              <Pressable
                style={styles.removeButton}
                onPress={() => updateSlot(type, index, null)}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={`Remove ${favorite.title} from favorites`}
              >
                <Ionicons name="close" size={14} color={colors.text} />
              </Pressable>
            ) : null}
          </View>
        );
      })}
    </View>
  );

  return (
    <>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          {photoURL ? (
            <Image source={{ uri: photoURL }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarInitial}>
                {name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View style={styles.identity}>
            <Text style={styles.username} numberOfLines={1}>
              {name}
            </Text>
            {subtitle ? (
              <Text style={styles.email} numberOfLines={1}>
                {subtitle}
              </Text>
            ) : null}
            <View style={styles.followRow}>
              <Pressable
                onPress={() =>
                  navigation.navigate("FollowList", { uid, type: "following" })
                }
                hitSlop={6}
              >
                <Text style={styles.followText}>
                  <Text style={styles.followCount}>{followingCount}</Text> Following
                </Text>
              </Pressable>
              <Text style={styles.followSeparator}>|</Text>
              <Pressable
                onPress={() =>
                  navigation.navigate("FollowList", { uid, type: "followers" })
                }
                hitSlop={6}
              >
                <Text style={styles.followText}>
                  <Text style={styles.followCount}>{followersCount}</Text>{" "}
                  {followersCount === 1 ? "Follower" : "Followers"}
                </Text>
              </Pressable>
            </View>
          </View>
          {headerRight}
        </View>

        {actions}

        <View style={styles.linksRow}>
          {links.map((link) => (
            <Pressable
              key={link.label}
              style={({ pressed }) => [styles.linkButton, pressed && styles.pressed]}
              onPress={link.open}
              accessibilityRole="button"
            >
              <Ionicons name={link.icon} size={22} color={colors.accent} />
              <Text style={styles.linkText} numberOfLines={1}>
                {link.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Favorite movies</Text>
        {renderFavorites("movie")}

        <Text style={styles.sectionTitle}>Favorite series</Text>
        {renderFavorites("tv")}
        {favoritesError ? (
          <Text style={styles.error}>{favoritesError}</Text>
        ) : null}

        <Text style={styles.sectionTitle}>Recent activity</Text>
        {reviews.length === 0 ? (
          <View style={styles.emptyActivity}>
            <Ionicons name="time-outline" size={24} color={colors.textMuted} />
            <Text style={styles.emptyText}>No recent activity yet</Text>
          </View>
        ) : (
          reviews.slice(0, 3).map((review) => (
            <ReviewItem
              key={`${review.mediaKey}-${review.createdAt}`}
              review={review}
              onPress={() =>
                navigation.navigate("MovieDetails", {
                  result: reviewToMedia(review),
                })
              }
            />
          ))
        )}
      </ScrollView>

      {isOwnProfile ? (
        <MoviePickerModal
          visible={pickingSlot !== null}
          mediaType={pickingSlot?.type ?? "movie"}
          onClose={() => setPickingSlot(null)}
          onSelect={handleSelect}
        />
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 14,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.surface,
  },
  avatarPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    borderColor: colors.border,
    borderWidth: 1,
  },
  avatarInitial: {
    color: colors.text,
    fontSize: 30,
    fontWeight: "700",
  },
  identity: {
    flex: 1,
  },
  username: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "700",
  },
  email: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: 2,
  },
  followRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 6,
  },
  followText: {
    color: colors.textMuted,
    fontSize: 13,
  },
  followCount: {
    color: colors.text,
    fontWeight: "700",
  },
  followSeparator: {
    color: colors.border,
  },
  linksRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 20,
  },
  linkButton: {
    flex: 1,
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.surface,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  linkText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "600",
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
    marginTop: 28,
    marginBottom: 12,
  },
  favoritesRow: {
    flexDirection: "row",
    gap: 12,
  },
  favoriteSlot: {
    flex: 1,
    aspectRatio: 2 / 3,
  },
  emptySlot: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 10,
  },
  favoritePoster: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    borderRadius: 10,
    overflow: "hidden",
  },
  posterImage: {
    width: "100%",
    height: "100%",
  },
  posterTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
    padding: 8,
  },
  removeButton: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  pressed: {
    opacity: 0.75,
  },
  emptyActivity: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 10,
    paddingVertical: 28,
    gap: 8,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
  },
  error: { color: "#ff6b6b", marginTop: 8 },
});
