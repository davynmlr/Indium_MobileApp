// One user in a list (search results, followers, following).
// Tapping it opens the user's profile.

import { Pressable, StyleSheet, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { UserSummary } from "../services/follows";
import type { RootStackParamList } from "../navigation/types";
import { colors } from "../theme/colors";

export default function UserRow({ user }: { user: UserSummary }) {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      onPress={() =>
        navigation.navigate("UserProfile", {
          uid: user.uid,
          username: user.username,
        })
      }
      accessibilityRole="button"
      accessibilityLabel={`Open ${user.username}'s profile`}
    >
      <View style={styles.avatar}>
        <Text style={styles.initial}>
          {user.username.charAt(0).toUpperCase()}
        </Text>
      </View>
      <Text style={styles.name} numberOfLines={1}>
        {user.username}
      </Text>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
  },
  pressed: { opacity: 0.75 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  initial: { color: colors.text, fontSize: 17, fontWeight: "700" },
  name: { flex: 1, color: colors.text, fontSize: 15, fontWeight: "600" },
});
