import { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  Pressable,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../hooks/useAuth";
import { subscribeToWatchlist } from "../services/watchlist";
import { getTmdbImageUrl, TmdbMediaResult } from "../services/tmdb";
import { colors } from "../theme/colors";

export default function WatchlistScreen({ navigation }: any) {
  const { user } = useAuth();
  const [watchlist, setWatchlist] = useState<TmdbMediaResult[]>([]);

  const uid = user?.uid;

  useEffect(() => {
    if (!uid) return;
    return subscribeToWatchlist(uid, setWatchlist);
  }, [uid]);

  if (!user) {
    return (
      <View style={styles.centered}>
        <Text style={styles.text}>Log in to see your watchlist.</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={styles.buttonText}>Log In / Register</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Text style={styles.title}>Watchlist</Text>
      <FlatList
        data={watchlist}
        numColumns={4}
        keyExtractor={(item) => `${item.media_type}-${item.id}`}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.text}>Your watchlist is empty.</Text>
        }
        renderItem={({ item }) => {
          const imageUrl = getTmdbImageUrl(item.poster_path, "w185");
          return (
            <Pressable
              style={styles.posterBox}
              onPress={() => navigation.navigate("MovieDetails", { result: item })}
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
            </Pressable>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "700",
    marginHorizontal: 12,
    marginVertical: 12,
  },
  list: {
    paddingHorizontal: 8,
  },
  // Each poster takes 1/4 of the width, so we get 4 per line.
  posterBox: {
    width: "25%",
    padding: 4,
  },
  poster: {
    width: "100%",
    aspectRatio: 2 / 3,
    borderRadius: 6,
    backgroundColor: colors.surface,
  },
  noPoster: {
    alignItems: "center",
    justifyContent: "center",
    padding: 4,
  },
  noPosterText: {
    color: colors.textMuted,
    fontSize: 11,
    textAlign: "center",
  },
  text: {
    color: colors.textMuted,
    fontSize: 15,
    textAlign: "center",
    marginTop: 20,
  },
  button: {
    backgroundColor: colors.accent,
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginTop: 16,
  },
  buttonText: {
    color: colors.text,
    fontWeight: "600",
  },
});
