import { View, Text, StyleSheet } from "react-native";

export default function AddMovieScreen() {
  return (
    <View style={styles.container}>
      <Text>Add Movie Screen</Text>
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
