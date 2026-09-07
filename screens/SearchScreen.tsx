import { useState } from "react";
import { View, Text, StyleSheet, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function SearchScreen() {
  const [query, setQuery] = useState("");

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.container}>
        <Text style={styles.title}>Search</Text>

        <View style={styles.searchBar}>
          <Ionicons
            name="search"
            size={24}
            color="#7F00FF"
            style={styles.searchBar}
          />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search for a movie/serie"
            placeholderTextColor="#6b7d8a"
            style={styles.input}
            autoCorrect={false}
          />
        </View>

        <View style={styles.resultsPlaceholder}>
          <Text style={styles.placeholderText}>
            {query.length > 0
              ? `Searching for "${query}"...`
              : "Start typing to find a movie"}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#14181c",
    paddingHorizontal: 16,
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 16,
    marginTop: 8,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1f262d",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: "#fff",
    fontSize: 15,
  },
  resultsPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    color: "#6b7d8a",
    fontSize: 14,
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#14181c",
  },
});
