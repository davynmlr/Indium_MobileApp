import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRoute } from "@react-navigation/native";
import { colors } from "../theme/colors";
import { tmdb, MediaType } from "../services/tmdb";

type RouteParams = {
  id: number;
  mediaType: MediaType;
};

export default function MovieDetailScreen() {
  const route = useRoute();
  const { id, mediaType } = route.params as RouteParams;

  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        setLoading(true);
        const data = await tmdb.getDetails(id, mediaType, controller.signal);
        setDetails(data);
        setError(null);
      } catch (err: any) {
        if (err.name !== "AbortError") setError("Couldn't load details.");
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [id, mediaType]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.text} />
      </SafeAreaView>
    );
  }

  if (error || !details) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.errorText}>{error ?? "Not found"}</Text>
      </SafeAreaView>
    );
  }

  const title = details.title ?? details.name;
  const releaseDate = details.release_date ?? details.first_air_date;
  const posterUri = tmdb.getImageUrl(details.poster_path, "w500");

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.container}>
        {posterUri && (
          <Image source={{ uri: posterUri }} style={styles.poster} />
        )}
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.meta}>
          {mediaType === "movie" ? "Movie" : "TV Series"} ·{" "}
          {releaseDate?.slice(0, 4) ?? "—"}
          {details.vote_average
            ? ` · ★ ${details.vote_average.toFixed(1)}`
            : ""}
        </Text>
        {details.genres?.length > 0 && (
          <Text style={styles.meta}>
            {details.genres.map((g: any) => g.name).join(", ")}
          </Text>
        )}
        <Text style={styles.overview}>
          {details.overview || "No overview available."}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { padding: 16, alignItems: "center" },
  poster: {
    width: 220,
    height: 330,
    borderRadius: 12,
    backgroundColor: colors.surface,
    marginBottom: 16,
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
  },
  meta: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: 6,
    textAlign: "center",
  },
  overview: { color: colors.text, fontSize: 14, marginTop: 16, lineHeight: 20 },
  errorText: { color: colors.textMuted, textAlign: "center", marginTop: 40 },
});
