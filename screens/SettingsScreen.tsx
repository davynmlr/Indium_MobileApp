import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { signOut } from "firebase/auth";
import { auth } from "../services/firebase";
import { useAuth } from "../hooks/useAuth";
import { colors } from "../theme/colors";

export default function SettingsScreen({ navigation }: any) {
  const { user } = useAuth();

  const handleLogOut = async () => {
    await signOut(auth);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Account</Text>
      <View style={styles.card}>
        {user?.displayName ? (
          <Text style={styles.value}>{user.displayName}</Text>
        ) : null}
        <Text style={styles.muted}>{user?.email}</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleLogOut}>
        <Text style={styles.buttonText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  label: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 14,
    marginBottom: 24,
  },
  value: { color: colors.text, fontSize: 16, fontWeight: "600" },
  muted: { color: colors.textMuted, fontSize: 14, marginTop: 2 },
  button: {
    backgroundColor: colors.accent,
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
  },
  buttonText: { color: colors.text, fontWeight: "600" },
});
