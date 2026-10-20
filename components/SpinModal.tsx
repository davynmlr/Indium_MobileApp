// "What to watch next?" window: the user picks a genre and spins.
// Posters from the watchlist flash by, slow down, and stop on a random title.

import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import Chip from "./Chip";
import {
  getMediaKey,
  getTmdbImageUrl,
  TmdbMediaResult,
} from "../services/tmdb";
import { colors } from "../theme/colors";

type Props = {
  visible: boolean;
  items: TmdbMediaResult[]; // the titles we can pick from
  genresByKey: Record<string, string[]>; // genre names of each title
  onClose: () => void;
  onOpen: (media: TmdbMediaResult) => void; // "See details"
};

const STEPS = 20; // number of posters shown before stopping
const FIRST_DELAY = 50; // ms between the first posters (it gets slower each step)

const randomItem = <T,>(list: T[]) =>
  list[Math.floor(Math.random() * list.length)];

export default function SpinModal({
  visible,
  items,
  genresByKey,
  onClose,
  onOpen,
}: Props) {
  const [genre, setGenre] = useState<string | null>(null); // null = all genres
  const [shown, setShown] = useState<TmdbMediaResult | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [done, setDone] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scale = useRef(new Animated.Value(1)).current;

  const stopTimer = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };

  // Fresh start each time the window opens, and stop the spin when it closes.
  useEffect(() => {
    if (visible) {
      setShown(null);
      setSpinning(false);
      setDone(false);
    }
    return stopTimer;
  }, [visible]);

  const genres = [
    ...new Set(items.flatMap((item) => genresByKey[getMediaKey(item)] ?? [])),
  ].sort();

  const candidates = genre
    ? items.filter((item) => genresByKey[getMediaKey(item)]?.includes(genre))
    : items;

  const spin = () => {
    if (candidates.length === 0 || spinning) return;
    stopTimer();
    const winner = randomItem(candidates);
    setSpinning(true);
    setDone(false);

    let step = 0;
    let delay = FIRST_DELAY;
    let previous: TmdbMediaResult | null = null;
    const tick = () => {
      step += 1;
      if (step >= STEPS) {
        // Last step: show the winner with a little bounce.
        setShown(winner);
        setSpinning(false);
        setDone(true);
        scale.setValue(0.85);
        Animated.spring(scale, {
          toValue: 1,
          friction: 4,
          useNativeDriver: true,
        }).start();
        return;
      }
      // Show a random poster (not the same one twice in a row, if possible).
      let next = randomItem(candidates);
      if (candidates.length > 1) {
        while (next === previous) next = randomItem(candidates);
      }
      previous = next;
      setShown(next);
      delay *= 1.15; // slower and slower
      timer.current = setTimeout(tick, delay);
    };
    tick();
  };

  const posterUrl = shown ? getTmdbImageUrl(shown.poster_path, "w342") : null;
  const year = (shown?.release_date ?? shown?.first_air_date ?? "").slice(0, 4);

  const chip = (label: string, active: boolean, onPress: () => void) => (
    <Chip
      key={label}
      label={label}
      active={active}
      onPress={onPress}
      disabled={spinning}
      variant="background"
    />
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.box}>
          <View style={styles.header}>
            <Text style={styles.title}>What to watch next?</Text>
            <Pressable
              onPress={onClose}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </Pressable>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chipScroll}
            contentContainerStyle={styles.chipRow}
          >
            {chip("All genres", genre === null, () => setGenre(null))}
            {genres.map((name) =>
              chip(name, genre === name, () => setGenre(name)),
            )}
          </ScrollView>

          <View style={styles.stage}>
            {shown ? (
              <Animated.View
                style={[styles.posterBox, { transform: [{ scale }] }]}
              >
                {posterUrl ? (
                  <Image source={{ uri: posterUrl }} style={styles.poster} />
                ) : (
                  <View style={[styles.poster, styles.noPoster]}>
                    <Text style={styles.noPosterText}>
                      {shown.title ?? shown.name}
                    </Text>
                  </View>
                )}
              </Animated.View>
            ) : (
              <View style={[styles.posterBox, styles.poster, styles.noPoster]}>
                <Ionicons
                  name="dice-outline"
                  size={48}
                  color={colors.textMuted}
                />
              </View>
            )}
          </View>

          <Text style={styles.result} numberOfLines={2}>
            {done && shown
              ? `${shown.title ?? shown.name}${year ? ` (${year})` : ""}`
              : spinning
                ? "Spinning…"
                : `${candidates.length} ${candidates.length === 1 ? "title" : "titles"} in the spin`}
          </Text>

          {done && shown ? (
            <TouchableOpacity
              style={styles.button}
              onPress={() => onOpen(shown)}
            >
              <Text style={styles.buttonText}>See details</Text>
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity
            style={[
              done ? styles.secondaryButton : styles.button,
              (spinning || candidates.length === 0) && styles.buttonDisabled,
            ]}
            onPress={spin}
            disabled={spinning || candidates.length === 0}
          >
            <Ionicons name="dice" size={18} color={colors.text} />
            <Text style={styles.buttonText}>
              {done ? "Spin again" : "Spin"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlayStrong,
    justifyContent: "center",
    padding: 24,
  },
  box: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { color: colors.text, fontSize: 18, fontWeight: "700" },
  chipScroll: { flexGrow: 0, marginTop: 14, marginHorizontal: -16 },
  chipRow: { gap: 8, paddingHorizontal: 16 },
  stage: { alignItems: "center", marginTop: 18 },
  posterBox: { width: 160 },
  poster: {
    width: 160,
    aspectRatio: 2 / 3,
    borderRadius: 8,
    backgroundColor: colors.background,
  },
  noPoster: { alignItems: "center", justifyContent: "center", padding: 8 },
  noPosterText: { color: colors.textMuted, textAlign: "center" },
  result: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 14,
    minHeight: 22,
  },
  button: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.accent,
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 14,
  },
  secondaryButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 10,
  },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { color: colors.text, fontSize: 15, fontWeight: "600" },
});
