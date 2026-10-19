import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import UserRow from "../components/UserRow";
import {
  subscribeToFollowers,
  subscribeToFollowing,
  UserSummary,
} from "../services/follows";
import type { RootStackParamList } from "../navigation/types";
import { colors } from "../theme/colors";

type Props = NativeStackScreenProps<RootStackParamList, "FollowList">;

// The followers or the following of a user (route.params.type says which one).
export default function FollowListScreen({ route, navigation }: Props) {
  const { uid, type } = route.params;
  const [users, setUsers] = useState<UserSummary[]>([]);

  useEffect(() => {
    navigation.setOptions({
      title: type === "followers" ? "Followers" : "Following",
    });
  }, [navigation, type]);

  useEffect(() => {
    const subscribe =
      type === "followers" ? subscribeToFollowers : subscribeToFollowing;
    return subscribe(uid, setUsers);
  }, [uid, type]);

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.list}
      data={users}
      keyExtractor={(item) => item.uid}
      renderItem={({ item }) => <UserRow user={item} />}
      ListEmptyComponent={
        <Text style={styles.empty}>
          {type === "followers" ? "No followers yet." : "Not following anyone yet."}
        </Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: 16 },
  empty: {
    color: colors.textMuted,
    fontSize: 15,
    textAlign: "center",
    marginTop: 20,
  },
});
