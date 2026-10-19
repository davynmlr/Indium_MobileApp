import { useEffect, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  View,
  Text,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAuth } from "../hooks/useAuth";
import MoviePickerModal from "../components/MoviePickerModal";
import ReviewItem from "../components/ReviewItem";
import LoggedOutView from "../components/LoggedOutView";
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
  getTmdbImageUrl,
  toSavedMedia,
  TmdbMediaResult,
} from "../services/tmdb";
import { colors } from "../theme/colors";

// Buttons at the top of the profile. Each one opens a page with this user's data.
const profileLinks = [
  { label: "Diary", icon: "book-outline", screen: "Diary" },
  { label: "Watchlist", icon: "bookmark-outline", screen: "UserWatchlist" },
  { label: "My series", icon: "tv-outline", screen: "MySeries" },
] as const;

export default function ProfileScreen({ navigation }: any) {
  const { user } = useAuth();
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

  const uid = user?.uid;

  useEffect(() => {
    if (!uid) return;
    return subscribeToFavorites(uid, setFavorites, () =>
      setFavoritesError("Could not load your favorites."),
    );
  }, [uid]);

  // The user's reviews, newest first (we show the last 3 in "Recent activity").
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    if (!uid) return;
    return subscribeToUserReviews(uid, setReviews);
  }, [uid]);

  if (!user) {
    return <LoggedOutView message="You're not logged in." />;
  }

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
      await saveFavorites(user.uid, type, next);
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
            <Pressable
              style={styles.removeButton}
              onPress={() => updateSlot(type, index, null)}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={`Remove ${favorite.title} from favorites`}
            >
              <Ionicons name="close" size={14} color={colors.text} />
            </Pressable>
          </View>
        );
      })}
    </View>
  );

  const name = user.displayName ?? user.email ?? "";

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          {user.photoURL ? (
            <Image source={{ uri: user.photoURL }} style={styles.avatar} />
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
            {user.displayName ? (
              <Text style={styles.email} numberOfLines={1}>
                {user.email}
              </Text>
            ) : null}
          </View>
          <Pressable
            onPress={() => navigation.navigate("Settings")}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Settings"
          >
            <Ionicons name="settings-outline" size={26} color={colors.text} />
          </Pressable>
        </View>

        <View style={styles.linksRow}>
          {profileLinks.map((link) => (
            <Pressable
              key={link.screen}
              style={({ pressed }) => [styles.linkButton, pressed && styles.pressed]}
              onPress={() => navigation.navigate(link.screen, { uid: user.uid })}
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

      <MoviePickerModal
        visible={pickingSlot !== null}
        mediaType={pickingSlot?.type ?? "movie"}
        onClose={() => setPickingSlot(null)}
        onSelect={handleSelect}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
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
  linksRow: {
    flexDirection: "row",
    gap: 10,
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
    fontSize: 13,
    fontWeight: "600",
  },
});
