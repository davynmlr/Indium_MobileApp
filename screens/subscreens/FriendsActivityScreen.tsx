import { View, Text, StyleSheet } from "react-native";
import { colors } from "../../theme/colors";

export default function FriendsActivityScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Friends Activity Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: colors.textMuted,
  },
});
