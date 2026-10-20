import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AppHeader from "../components/AppHeader";
import { useAuth } from "../hooks/useAuth";
import LoggedOutView from "../components/LoggedOutView";
import PosterGrid from "../components/PosterGrid";
import SpinModal from "../components/SpinModal";
import Chip from "../components/Chip";
import { subscribeToWatchlist } from "../services/watchlist";
import { getMediaKey, getTmdbGenres, TmdbMediaResult } from "../services/tmdb";
import { colors } from "../theme/colors";

const typeFilters = [
  { value: "all", label: "All" },
  { value: "movie", label: "Movies" },
  { value: "tv", label: "Series" },
] as const;

const sortOptions = [
  { value: "added-desc", label: "Recently added" },
  { value: "added-asc", label: "First added" },
  { value: "year-desc", label: "Year: new → old" },
  { value: "year-asc", label: "Year: old → new" },
] as const;
type SortOption = (typeof sortOptions)[number]["value"];

// Release year of a title, or null if unknown.
const getYear = (item: TmdbMediaResult) => {
  const year = parseInt(
    (item.release_date ?? item.first_air_date ?? "").slice(0, 4),
    10,
  );
  return Number.isNaN(year) ? null : year;
};

// Shows the watchlist of a user.
// - From the bottom tab: no params, it shows the logged-in user's watchlist.
// - From a profile: route.params.uid says whose watchlist to show
//   (later, friends can open each other's watchlist this way).
export default function WatchlistScreen({ route, navigation }: any) {
  const { user } = useAuth();
  const [watchlist, setWatchlist] = useState<TmdbMediaResult[]>([]);
  // Which titles to show: everything, only movies or only series.
  const [filter, setFilter] = useState<"all" | "movie" | "tv">("all");
  const [sort, setSort] = useState<SortOption>("added-desc");
  const [genre, setGenre] = useState<string | null>(null); // null = all genres
  // Genre names of each title, by media key (loaded from TMDB).
  const [genresByKey, setGenresByKey] = useState<Record<string, string[]>>({});
  const [spinOpen, setSpinOpen] = useState(false);

  const profileUid: string | undefined = route?.params?.uid;
  const uid = profileUid ?? user?.uid;
  // Opened from a profile: the screen header already shows the title.
  const fromProfile = profileUid !== undefined;

  useEffect(() => {
    if (!uid) return;
    return subscribeToWatchlist(uid, setWatchlist);
  }, [uid]);

  // The saved titles don't have their genres, so we ask TMDB for each one.
  useEffect(() => {
    let cancelled = false;
    for (const item of watchlist) {
      getTmdbGenres(item)
        .then((names) => {
          if (!cancelled) {
            setGenresByKey((current) => ({
              ...current,
              [getMediaKey(item)]: names,
            }));
          }
        })
        .catch(() => {});
    }
    return () => {
      cancelled = true;
    };
  }, [watchlist]);

  if (!uid) {
    return <LoggedOutView message="Log in to see your watchlist." />;
  }

  const byType =
    filter === "all"
      ? watchlist
      : watchlist.filter((item) => item.media_type === filter);

  // Genres found in the titles shown, A to Z.
  const genres = [
    ...new Set(byType.flatMap((item) => genresByKey[getMediaKey(item)] ?? [])),
  ].sort();
  // If the chosen genre is not in the list anymore (other type selected), ignore it.
  const activeGenre = genre && genres.includes(genre) ? genre : null;

  const filtered = activeGenre
    ? byType.filter((item) =>
        genresByKey[getMediaKey(item)]?.includes(activeGenre),
      )
    : byType;

  // The watchlist is saved in the order titles were added (oldest first).
  const sorted = [...filtered];
  if (sort === "added-desc") sorted.reverse();
  if (sort === "year-desc" || sort === "year-asc") {
    const direction = sort === "year-desc" ? -1 : 1;
    sorted.sort((a, b) => {
      const yearA = getYear(a);
      const yearB = getYear(b);
      // Titles without a year go at the end.
      if (yearA === null) return yearB === null ? 0 : 1;
      if (yearB === null) return -1;
      return (yearA - yearB) * direction;
    });
  }

  const chip = (label: string, active: boolean, onPress: () => void) => (
    <Chip key={label} label={label} active={active} onPress={onPress} />
  );

  return (
    <SafeAreaView style={styles.container} edges={fromProfile ? [] : ["top"]}>
      {fromProfile ? null : (
        <>
          <AppHeader />
          <Text style={styles.title}>Watchlist</Text>
        </>
      )}
      <View style={[styles.filterRow, fromProfile && styles.filterRowTop]}>
        {typeFilters.map((option) =>
          chip(option.label, filter === option.value, () =>
            setFilter(option.value),
          ),
        )}
        {byType.length > 0 ? (
          <Chip
            label="Spin"
            icon="dice"
            style={styles.spinButton}
            onPress={() => setSpinOpen(true)}
            accessibilityLabel="Spin to pick a random title"
          />
        ) : null}
      </View>

      {/* Picks from the titles of the chosen type (All / Movies / Series). */}
      <SpinModal
        visible={spinOpen}
        items={byType}
        genresByKey={genresByKey}
        onClose={() => setSpinOpen(false)}
        onOpen={(media) => {
          setSpinOpen(false);
          navigation.navigate("MovieDetails", { result: media });
        }}
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scrollRow}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.rowLabel}>Sort</Text>
        {sortOptions.map((option) =>
          chip(option.label, sort === option.value, () =>
            setSort(option.value),
          ),
        )}
      </ScrollView>

      {genres.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.scrollRow}
          contentContainerStyle={styles.scrollContent}
        >
          <Text style={styles.rowLabel}>Genre</Text>
          {chip("All genres", activeGenre === null, () => setGenre(null))}
          {genres.map((name) =>
            chip(name, activeGenre === name, () => setGenre(name)),
          )}
        </ScrollView>
      ) : null}

      <PosterGrid
        data={sorted}
        emptyText={
          watchlist.length === 0
            ? "Nothing here yet."
            : "Nothing matches these filters."
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "700",
    marginHorizontal: 12,
    marginVertical: 12,
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    marginHorizontal: 12,
    marginBottom: 10,
  },
  filterRowTop: {
    marginTop: 12,
  },
  scrollRow: {
    flexGrow: 0,
    marginBottom: 10,
  },
  scrollContent: {
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
  },
  rowLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    marginRight: 2,
  },
  // Pushed to the right of the row.
  spinButton: {
    marginLeft: "auto",
    borderWidth: 1,
    borderColor: colors.accent,
  },
});
