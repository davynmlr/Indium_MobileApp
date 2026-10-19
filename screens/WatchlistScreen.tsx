import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../hooks/useAuth";
import LoggedOutView from "../components/LoggedOutView";
import PosterGrid from "../components/PosterGrid";
import { subscribeToWatchlist } from "../services/watchlist";
import type { TmdbMediaResult } from "../services/tmdb";
import { colors } from "../theme/colors";

// Shows the watchlist of a user.
// - From the bottom tab: no params, it shows the logged-in user's watchlist.
// - From a profile: route.params.uid says whose watchlist to show
//   (later, friends can open each other's watchlist this way).
export default function WatchlistScreen({ route }: any) {
  const { user } = useAuth();
  const [watchlist, setWatchlist] = useState<TmdbMediaResult[]>([]);
  // Which titles to show: everything, only movies or only series.
  const [filter, setFilter] = useState<"all" | "movie" | "tv">("all");

  const profileUid: string | undefined = route?.params?.uid;
  const uid = profileUid ?? user?.uid;
  // Opened from a profile: the screen header already shows the title.
  const fromProfile = profileUid !== undefined;

  useEffect(() => {
    if (!uid) return;
    return subscribeToWatchlist(uid, setWatchlist);
  }, [uid]);

  if (!uid) {
    return <LoggedOutView message="Log in to see your watchlist." />;
  }

  const filteredList =
    filter === "all"
      ? watchlist
      : watchlist.filter((item) => item.media_type === filter);

  const filters = [
    { value: "all", label: "All" },
    { value: "movie", label: "Movies" },
    { value: "tv", label: "Series" },
  ] as const;

  return (
    <SafeAreaView style={styles.container} edges={fromProfile ? [] : ["top"]}>
      {fromProfile ? null : <Text style={styles.title}>Watchlist</Text>}
      <View style={[styles.filterRow, fromProfile && styles.filterRowTop]}>
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
      <PosterGrid data={filteredList} emptyText="Nothing here yet." />
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
    marginBottom: 12,
  },
  filterRowTop: {
    marginTop: 12,
  },
  filterButton: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  filterButtonActive: {
    backgroundColor: colors.accent,
  },
  filterText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "600",
  },
});
