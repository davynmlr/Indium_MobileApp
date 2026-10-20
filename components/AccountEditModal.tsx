// Window to change the password or the email (from Settings).
// Both ask for the current password first.

import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import type { User } from "firebase/auth";
import {
  accountErrorMessage,
  changePassword,
  requestEmailChange,
} from "../services/account";
import { colors } from "../theme/colors";

type Props = {
  mode: "password" | "email" | null; // null = closed
  user: User;
  onClose: () => void;
};

export default function AccountEditModal({ mode, user, onClose }: Props) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newValue, setNewValue] = useState(""); // new password or new email
  const [confirmValue, setConfirmValue] = useState(""); // new password again
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  // Empty form each time the window opens.
  useEffect(() => {
    setCurrentPassword("");
    setNewValue("");
    setConfirmValue("");
    setError("");
    setSuccess("");
    setSaving(false);
  }, [mode]);

  const isPassword = mode === "password";

  const submit = async () => {
    setError("");
    const value = newValue.trim();
    if (!currentPassword) {
      setError("Enter your current password.");
      return;
    }
    if (isPassword) {
      if (newValue.length < 6) {
        setError("The new password should be at least 6 characters.");
        return;
      }
      if (newValue !== confirmValue) {
        setError("The two new passwords are not the same.");
        return;
      }
    } else if (value.toLowerCase() === user.email?.toLowerCase()) {
      setError("This is already your email.");
      return;
    }

    setSaving(true);
    try {
      if (isPassword) {
        await changePassword(user, currentPassword, newValue);
        setSuccess("Your password has been changed.");
      } else {
        await requestEmailChange(user, currentPassword, value);
        setSuccess(
          `We sent a link to ${value}. Open it to confirm the change, then log in again with your new email.`,
        );
      }
    } catch (e) {
      setError(accountErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      visible={mode !== null}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.box}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {isPassword ? "Change password" : "Change email"}
            </Text>
            <Pressable
              onPress={onClose}
              hitSlop={12}
              accessibilityLabel="Close"
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </Pressable>
          </View>

          {success ? (
            <>
              <View style={styles.successRow}>
                <Ionicons
                  name="checkmark-circle"
                  size={22}
                  color={colors.accent}
                />
                <Text style={styles.successText}>{success}</Text>
              </View>
              <TouchableOpacity style={styles.button} onPress={onClose}>
                <Text style={styles.buttonText}>Done</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              {!isPassword ? (
                <Text style={styles.hint}>Current email: {user.email}</Text>
              ) : null}

              <TextInput
                style={styles.input}
                placeholder="Current password"
                placeholderTextColor={colors.placeholder}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry
                autoCapitalize="none"
              />
              <TextInput
                style={styles.input}
                placeholder={isPassword ? "New password" : "New email"}
                placeholderTextColor={colors.placeholder}
                value={newValue}
                onChangeText={setNewValue}
                secureTextEntry={isPassword}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType={isPassword ? "default" : "email-address"}
              />
              {isPassword ? (
                <TextInput
                  style={styles.input}
                  placeholder="New password again"
                  placeholderTextColor={colors.placeholder}
                  value={confirmValue}
                  onChangeText={setConfirmValue}
                  secureTextEntry
                  autoCapitalize="none"
                />
              ) : null}

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <TouchableOpacity
                style={[styles.button, saving && styles.buttonDisabled]}
                onPress={submit}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color={colors.text} />
                ) : (
                  <Text style={styles.buttonText}>
                    {isPassword ? "Change password" : "Send confirmation link"}
                  </Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
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
    marginBottom: 12,
  },
  title: { color: colors.text, fontSize: 18, fontWeight: "700" },
  hint: { color: colors.textMuted, fontSize: 13, marginBottom: 10 },
  input: {
    backgroundColor: colors.background,
    borderRadius: 8,
    color: colors.text,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    marginBottom: 10,
  },
  error: { color: colors.error, marginBottom: 10 },
  successRow: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  successText: { flex: 1, color: colors.text, fontSize: 14, lineHeight: 20 },
  button: {
    backgroundColor: colors.accent,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 6,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: colors.text, fontSize: 15, fontWeight: "600" },
});
