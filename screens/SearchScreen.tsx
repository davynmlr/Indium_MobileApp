import { useState } from "react";
import { View, Text, StyleSheet, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { colors } from "../theme/colors";

export default function SearchScreen() {
  const [query, setQuery] = useState("");

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.container}>
        <Text style={styles.title}>Search</Text>

        <View style={styles.searchBar}>
          <Ionicons
            name="search"
            size={20}
            color={colors.textMuted}
            style={styles.icon}
          />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search for a movie/series"
            placeholderTextColor={colors.placeholder}
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
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 16,
    marginTop: 8,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
  },
  resultsPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    color: colors.textMuted,
    fontSize: 14,
  },
});
