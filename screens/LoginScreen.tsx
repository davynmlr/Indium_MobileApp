import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import {
  createUserWithEmailAndPassword,
  deleteUser,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { auth } from "../services/firebase";
import {
  USERNAME_REGEX,
  claimUsername,
  isUsernameTaken,
  removeEmailFromUsername,
} from "../services/usernames";
import { colors } from "../theme/colors";

export default function LoginScreen({ navigation }: any) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [usernameTaken, setUsernameTaken] = useState(false);

  const checkUsername = async () => {
    if (!USERNAME_REGEX.test(username.trim())) return;
    try {
      setUsernameTaken(await isUsernameTaken(username));
    } catch {
      // Ignore: the check runs again on submit.
    }
  };

  const register = async () => {
    const name = username.trim();
    if (!USERNAME_REGEX.test(name)) {
      setError(
        "Username must be 3-20 characters: letters, numbers or underscores.",
      );
      return;
    }
    if (await isUsernameTaken(name)) {
      setUsernameTaken(true);
      return;
    }

    const { user } = await createUserWithEmailAndPassword(
      auth,
      email.trim(),
      password,
    );
    try {
      await claimUsername(name, user.uid);
      await updateProfile(user, { displayName: name });
    } catch (e: any) {
      // Don't leave an account without a username behind.
      await deleteUser(user).catch(() => {});
      throw e;
    }

    // Registering signs the user in automatically: sign out so they log in themselves.
    await signOut(auth);
    setPassword("");
    setIsRegister(false);
    setNotice("Account created. You can now log in.");
  };

  const login = async () => {
    // Login is by email only: usernames are public, emails stay private.
    const { user } = await signInWithEmailAndPassword(
      auth,
      email.trim(),
      password,
    );
    // Old accounts: remove the email from the public username document.
    // Not awaited: the user doesn't have to wait for this cleanup.
    removeEmailFromUsername(user).catch(() => {});
    navigation.popTo("Main", { screen: "Profile" });
  };

  const handleSubmit = async () => {
    setError("");
    setNotice("");
    try {
      if (isRegister) {
        await register();
      } else {
        await login();
      }
    } catch (e: any) {
      if (e.code === "username-taken") {
        setUsernameTaken(true);
      } else if (e.code === "auth/email-already-in-use") {
        setError("This email is already registered. Try logging in instead.");
      } else if (e.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (e.code === "auth/weak-password") {
        setError("Password should be at least 6 characters.");
      } else if (e.code === "auth/invalid-credential") {
        setError("Incorrect email or password.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Indium</Text>

      {isRegister ? (
        <>
          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor={colors.placeholder}
            value={username}
            onChangeText={(text) => {
              setUsername(text);
              setUsernameTaken(false);
            }}
            onBlur={checkUsername}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {usernameTaken ? (
            <Text style={styles.usernameTaken}>username is taken</Text>
          ) : null}
        </>
      ) : null}
      <TextInput
        style={styles.input}
        placeholder="Email address"
        placeholderTextColor={colors.placeholder}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor={colors.placeholder}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {notice ? <Text style={styles.notice}>{notice}</Text> : null}

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>
          {isRegister ? "Register" : "Log In"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setIsRegister(!isRegister)}>
        <Text style={styles.switchText}>
          {isRegister
            ? "Already have an account? Log in"
            : "No account? Register"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.replace("Main")}>
        <Text style={styles.guestText}>Continue as guest</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    padding: 24,
  },
  title: {
    color: colors.text,
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 32,
  },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    color: colors.text,
    marginBottom: 12,
  },
  button: {
    backgroundColor: colors.accent,
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: { color: colors.text, fontWeight: "600" },
  switchText: { color: colors.textMuted, textAlign: "center", marginTop: 16 },
  guestText: {
    color: colors.textMuted,
    textAlign: "center",
    marginTop: 24,
    textDecorationLine: "underline",
  },
  error: { color: colors.error, textAlign: "center", marginBottom: 8 },
  notice: { color: colors.success, textAlign: "center", marginBottom: 8 },
  usernameTaken: {
    color: colors.warning,
    fontSize: 12,
    marginTop: -8,
    marginBottom: 12,
    marginLeft: 4,
  },
});
