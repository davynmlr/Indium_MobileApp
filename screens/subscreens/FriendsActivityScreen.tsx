import { View, Text, StyleSheet } from "react-native";

export default function FriendsActivityScreen() {
  return (
    <View style={styles.container}>
      <Text>Friends Activity Screen</Text>
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
