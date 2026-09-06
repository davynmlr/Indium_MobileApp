import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, Button } from "react-native";

export default function App() {
  return (
    <View style={styles.container}>
      <Text>Movie Club</Text>
      <StatusBar style="auto" />
      <View style={buttonPageStyles.Container}>
        <Button title="Add Movie" onPress={() => {}} />
        <Button title="View Movies" onPress={() => {}} />
        <Button title="Remove Movie" onPress={() => {}} />
      </View>
    </View>
  );
}

const buttonPageStyles = StyleSheet.create({
  Container: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
