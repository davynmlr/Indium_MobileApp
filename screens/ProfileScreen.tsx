import { Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAuth } from "../hooks/useAuth";
import LoggedOutView from "../components/LoggedOutView";
import ProfileView from "../components/ProfileView";
import { colors } from "../theme/colors";

// The profile of the logged-in user (bottom tab).
export default function ProfileScreen({ navigation }: any) {
  const { user } = useAuth();

  if (!user) {
    return <LoggedOutView message="You're not logged in." />;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ProfileView
        uid={user.uid}
        name={user.displayName ?? user.email ?? ""}
        subtitle={user.displayName ? user.email : null}
        photoURL={user.photoURL}
        isOwnProfile
        headerRight={
          <Pressable
            onPress={() => navigation.navigate("Settings")}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Settings"
          >
            <Ionicons name="settings-outline" size={26} color={colors.text} />
          </Pressable>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
