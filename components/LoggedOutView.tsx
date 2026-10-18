// Shown instead of a screen when the user is not logged in.
// It shows a message and a button to go to the Login screen.

import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { colors } from "../theme/colors";

type Props = {
  message: string;
};

export default function LoggedOutView({ message }: Props) {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{message}</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Login")}
      >
        <Text style={styles.buttonText}>Log In / Register</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  text: {
    color: colors.text,
    fontSize: 18,
    marginBottom: 16,
    textAlign: "center",
  },
  button: {
    backgroundColor: colors.accent,
    borderRadius: 8,
    padding: 14,
    paddingHorizontal: 24,
  },
  buttonText: {
    color: colors.text,
    fontWeight: "600",
  },
});
