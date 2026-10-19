// A grid of posters, 4 per line. Tapping a poster opens its details page.
// Used by the Watchlist screen.

import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { getTmdbImageUrl, TmdbMediaResult } from "../services/tmdb";
import type { RootStackParamList } from "../navigation/types";
import { colors } from "../theme/colors";

type Props = {
  data: TmdbMediaResult[];
  emptyText: string;
};

export default function PosterGrid({ data, emptyText }: Props) {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <FlatList
      data={data}
      numColumns={4}
      keyExtractor={(item) => `${item.media_type}-${item.id}`}
      contentContainerStyle={styles.list}
      ListEmptyComponent={<Text style={styles.text}>{emptyText}</Text>}
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
  );
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: 8,
    paddingBottom: 16,
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
});
