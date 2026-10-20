// Cinema mode: lowers the screen brightness while a trailer is playing,
// and puts it back when the trailer is closed (or the app goes in the background).
// The on/off choice is remembered on the phone.

import { useEffect, useState } from "react";
import { AppState, Platform } from "react-native";
import * as Brightness from "expo-brightness";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "cinemaMode";
const DIM_LEVEL = 0.15; // 0 = black, 1 = full brightness

// `playing` = true while the trailer is open.
export function useCinemaMode(playing: boolean) {
  const [enabled, setEnabled] = useState(false);

  // Load the saved choice once.
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((value) => setEnabled(value === "on"))
      .catch(() => {});
  }, []);

  const toggle = (value: boolean) => {
    setEnabled(value);
    AsyncStorage.setItem(STORAGE_KEY, value ? "on" : "off").catch(() => {});
  };

  const dim = playing && enabled;

  useEffect(() => {
    if (!dim) return;

    let saved: number | null = null; // brightness before dimming
    let dimmed = false;
    // The brightness calls are async: we run them one after the other,
    // so "restore" never runs before "dim" has finished.
    let queue = Promise.resolve();
    const run = (step: () => Promise<void>) => {
      queue = queue.then(step).catch(() => {});
    };

    const dimScreen = () =>
      run(async () => {
        if (dimmed) return;
        dimmed = true;
        saved = await Brightness.getBrightnessAsync();
        await Brightness.setBrightnessAsync(DIM_LEVEL);
      });

    const restoreScreen = () =>
      run(async () => {
        if (!dimmed) return;
        dimmed = false;
        if (Platform.OS === "android") {
          // Android: go back to the phone's normal brightness.
          await Brightness.restoreSystemBrightnessAsync();
        } else if (saved !== null) {
          // iOS: the change stays even outside the app, so we put the old value back.
          await Brightness.setBrightnessAsync(saved);
        }
      });

    dimScreen();
    // Leaving the app: normal brightness. Coming back: dim again.
    const subscription = AppState.addEventListener("change", (state) =>
      state === "active" ? dimScreen() : restoreScreen(),
    );

    return () => {
      subscription.remove();
      restoreScreen();
    };
  }, [dim]);

  return { enabled, toggle };
}
