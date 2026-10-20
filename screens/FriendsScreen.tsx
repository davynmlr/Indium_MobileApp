import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import AppHeader from "../components/AppHeader";
import { useAuth } from "../hooks/useAuth";
import LoggedOutView from "../components/LoggedOutView";
import UserRow from "../components/UserRow";
import ReviewItem from "../components/ReviewItem";
import { searchUsers } from "../services/usernames";
import type { UserSummary } from "../services/follows";
import { mediaFromKey } from "../services/tmdb";
import { useFriendsActivity } from "../hooks/useFriendsActivity";
import { colors } from "../theme/colors";

// Friends tab: search other users by username.
// When the search is empty, it shows the activity (reviews) of the people the user follows.
export default function FriendsScreen({ navigation }: any) {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<UserSummary[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { following, activity } = useFriendsActivity();

  const uid = user?.uid;

  // Search 300 ms after the user stops typing, not at every letter.
  useEffect(() => {
    const text = search.trim();
    if (!text) {
      setResults([]);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    let cancelled = false;
    const timer = setTimeout(() => {
      searchUsers(text)
        .then((users) => {
          // Don't show yourself in the results.
          if (!cancelled) setResults(users.filter((u) => u.uid !== uid));
        })
        .catch(() => {
          if (!cancelled) setResults([]);
        })
        .finally(() => {
          if (!cancelled) setIsSearching(false);
        });
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [search, uid]);

  if (!user) {
    return <LoggedOutView message="Log in to find your friends." />;
  }

  const hasSearch = search.trim().length > 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <AppHeader />
      <Text style={styles.title}>Friends</Text>

      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={colors.textMuted} />
        <TextInput
          style={styles.input}
          value={search}
          onChangeText={setSearch}
          placeholder="Search users"
          placeholderTextColor={colors.placeholder}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {isSearching ? <ActivityIndicator color={colors.accent} /> : null}
      </View>

      {hasSearch ? (
        <FlatList
          contentContainerStyle={styles.list}
          data={results}
          keyExtractor={(item) => item.uid}
          renderItem={({ item }) => <UserRow user={item} />}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            isSearching ? null : <Text style={styles.empty}>No users found.</Text>
          }
        />
      ) : (
        <FlatList
          contentContainerStyle={styles.list}
          data={activity.slice(0, 50)}
          keyExtractor={(item) => `${item.uid}-${item.mediaKey}-${item.createdAt}`}
          renderItem={({ item }) => (
            <ReviewItem
              review={item}
              showUser
              onUserPress={() =>
                navigation.navigate("UserProfile", {
                  uid: item.uid,
                  username: item.username,
                })
              }
              onPress={() =>
                navigation.navigate("MovieDetails", { result: mediaFromKey(item) })
              }
            />
          )}
          ListHeaderComponent={<Text style={styles.sectionTitle}>Activity</Text>}
          ListEmptyComponent={
            <Text style={styles.empty}>
              {following.length === 0
                ? "Follow people to see their activity here. Search for a username above."
                : "The people you follow haven't reviewed anything yet."}
            </Text>
          }
        />
      )}
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
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.surface,
    borderRadius: 10,
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    paddingVertical: 10,
  },
  list: {
    padding: 16,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  empty: {
    color: colors.textMuted,
    fontSize: 15,
    textAlign: "center",
    marginTop: 20,
  },
});
