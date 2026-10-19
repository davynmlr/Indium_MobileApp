import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { colors } from "../theme/colors";

// Placeholder for friend features (friends list, friends' activity, ...).
export default function FriendsScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Text style={styles.title}>Friends</Text>
      <View style={styles.empty}>
        <Ionicons name="people-outline" size={32} color={colors.accent} />
        <Text style={styles.text}>Your friends&apos; activity will appear here.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "700",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 32,
  },
  text: {
    color: colors.textMuted,
    fontSize: 15,
    textAlign: "center",
  },
});
