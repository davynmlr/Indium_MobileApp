import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { signOut } from "firebase/auth";
import { auth } from "../services/firebase";
import { useAuth } from "../hooks/useAuth";
import {
  pickProfilePhoto,
  saveProfilePhoto,
  subscribeToProfilePhoto,
} from "../services/profilePhoto";
import { colors } from "../theme/colors";

export default function SettingsScreen({ navigation }: any) {
  const { user } = useAuth();
  const [photo, setPhoto] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const uid = user?.uid;
  useEffect(() => {
    if (!uid) return;
    return subscribeToProfilePhoto(uid, setPhoto);
  }, [uid]);

  const handleLogOut = async () => {
    await signOut(auth);
    navigation.goBack();
  };

  const handleChangePhoto = async () => {
    if (!uid) return;
    setError("");
    try {
      const newPhoto = await pickProfilePhoto();
      if (!newPhoto) return; // cancelled
      setSaving(true);
      await saveProfilePhoto(uid, newPhoto);
    } catch (e: any) {
      setError(
        e?.code === "permission-denied"
          ? "Allow access to your photos in the phone settings."
          : "Could not update your photo.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (!uid) return;
    setError("");
    setSaving(true);
    try {
      await saveProfilePhoto(uid, null);
    } catch {
      setError("Could not remove your photo.");
    } finally {
      setSaving(false);
    }
  };

  const name = user?.displayName ?? user?.email ?? "";

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Profile photo</Text>
      <View style={[styles.card, styles.photoCard]}>
        {photo ? (
          <Image source={{ uri: photo }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarInitial}>
              {name.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <View style={styles.photoActions}>
          {saving ? (
            <ActivityIndicator color={colors.accent} />
          ) : (
            <>
              <TouchableOpacity onPress={handleChangePhoto}>
                <Text style={styles.link}>
                  {photo ? "Change photo" : "Add photo"}
                </Text>
              </TouchableOpacity>
              {photo ? (
                <TouchableOpacity onPress={handleRemovePhoto}>
                  <Text style={styles.muted}>Remove photo</Text>
                </TouchableOpacity>
              ) : null}
            </>
          )}
        </View>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}

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
  photoCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.background,
  },
  avatarPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    borderColor: colors.border,
    borderWidth: 1,
  },
  avatarInitial: { color: colors.text, fontSize: 26, fontWeight: "700" },
  photoActions: { flex: 1, gap: 10, alignItems: "flex-start" },
  link: { color: colors.accent, fontSize: 16, fontWeight: "600" },
  value: { color: colors.text, fontSize: 16, fontWeight: "600" },
  muted: { color: colors.textMuted, fontSize: 14, marginTop: 2 },
  error: { color: "#ff6b6b", marginTop: -16, marginBottom: 24 },
  button: {
    backgroundColor: colors.accent,
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
  },
  buttonText: { color: colors.text, fontWeight: "600" },
});
