import { View, Text, StyleSheet } from "react-native";

export default function MoviesScreen() {
  return (
    <View style={styles.container}>
      <Text>Movies Screen</Text>
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
