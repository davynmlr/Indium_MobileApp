// Details page: the trailer thumbnail. Tapping it opens the in-app player.

import { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Speech from "expo-speech";
import TrailerModal from "../TrailerModal";
import type { TmdbVideo } from "../../services/tmdb";
import { colors } from "../../theme/colors";

type Props = {
  trailer: TmdbVideo;
  title: string;
};

export default function TrailerSection({ trailer, title }: Props) {
  const [open, setOpen] = useState(false);

  const openTrailer = () => {
    // Stop the synopsis voice, so it doesn't play over the trailer.
    Speech.stop();
    setOpen(true);
  };

  return (
    <>
      <Text style={styles.sectionTitle}>Trailer</Text>
      <TouchableOpacity
        style={styles.trailer}
        onPress={openTrailer}
        accessibilityRole="button"
        accessibilityLabel={`Play the trailer of ${title}`}
      >
        <Image
          source={{
            uri: `https://img.youtube.com/vi/${trailer.key}/hqdefault.jpg`,
          }}
          style={styles.image}
        />
        <View style={styles.play}>
          <Ionicons name="play" size={30} color={colors.text} />
        </View>
      </TouchableOpacity>
      <Text style={styles.name} numberOfLines={1}>
        {trailer.name}
      </Text>
      <TrailerModal
        visible={open}
        trailer={trailer}
        title={title}
        onClose={() => setOpen(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
    marginTop: 24,
  },
  trailer: {
    marginTop: 10,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  image: { width: "100%", aspectRatio: 16 / 9 },
  play: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.overlay,
    paddingLeft: 4, // the play triangle looks centered this way
  },
  name: { color: colors.textMuted, fontSize: 13, marginTop: 6 },
});
