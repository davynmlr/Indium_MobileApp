import { View, Text, StyleSheet } from "react-native";

export default function WatchlistScreen() {
  return (
    <View style={styles.container}>
      <Text>Watchlist Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
