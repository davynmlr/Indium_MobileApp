import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useAuth } from "../hooks/useAuth";
import ProfileView from "../components/ProfileView";
import {
  followUser,
  subscribeToIsFollowing,
  unfollowUser,
} from "../services/follows";
import type { RootStackParamList } from "../navigation/types";
import { colors } from "../theme/colors";

type Props = NativeStackScreenProps<RootStackParamList, "UserProfile">;

// The profile of another user, with a Follow / Following button.
export default function UserProfileScreen({ route, navigation }: Props) {
  const { uid, username } = route.params;
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [error, setError] = useState("");

  const myUid = user?.uid;
  const isMe = myUid === uid;

  useEffect(() => {
    navigation.setOptions({ title: username });
  }, [navigation, username]);

  useEffect(() => {
    if (!myUid || isMe) return;
    return subscribeToIsFollowing(myUid, uid, setIsFollowing);
  }, [myUid, uid, isMe]);

  const toggleFollow = async () => {
    if (!user) {
      navigation.navigate("Login");
      return;
    }
    setError("");
    try {
      if (isFollowing) {
        await unfollowUser(user.uid, uid);
      } else {
        await followUser(
          { uid: user.uid, username: user.displayName ?? user.email ?? "" },
          { uid, username },
        );
      }
    } catch {
      setError("Could not update. Try again.");
    }
  };

  return (
    <View style={styles.container}>
      <ProfileView
        uid={uid}
        name={username}
        isOwnProfile={false}
        actions={
          isMe ? null : (
            <>
              <TouchableOpacity
                style={[styles.followButton, isFollowing && styles.followingButton]}
                onPress={toggleFollow}
              >
                <Text style={styles.followButtonText}>
                  {isFollowing ? "Following" : "Follow"}
                </Text>
              </TouchableOpacity>
              {error ? <Text style={styles.error}>{error}</Text> : null}
            </>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  followButton: {
    backgroundColor: colors.accent,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
    marginTop: 16,
  },
  // Already following: outlined button (tap again to unfollow).
  followingButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  followButtonText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "600",
  },
  error: { color: "#ff6b6b", marginTop: 8 },
});
