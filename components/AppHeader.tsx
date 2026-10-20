// The top bar of the main tabs: the Indium logo and name.

import { Image, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";

export default function AppHeader() {
  return (
    <View style={styles.bar} accessibilityRole="header" accessibilityLabel="Indium">
      <Image source={require("../assets/logo.png")} style={styles.logo} />
      <Text style={styles.name}>
        Ind<Text style={styles.accent}>ium</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.background,
    borderBottomColor: colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  logo: {
    width: 34,
    height: 34,
    borderRadius: 9,
  },
  name: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  accent: {
    color: colors.accent,
  },
});
