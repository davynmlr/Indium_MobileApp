import { View, Text, StyleSheet } from "react-native";

export default function MyActivityScreen() {
  return (
    <View style={styles.container}>
      <Text>My Activity Screen</Text>
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
