import { View, Text, StyleSheet } from "react-native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { SafeAreaView } from "react-native-safe-area-context";
import MyActivityScreen from "./subscreens/MyActivityScreen";
import FriendsActivityScreen from "./subscreens/FriendsActivityScreen";

const TopTab = createMaterialTopTabNavigator();

export default function ActivityScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <TopTab.Navigator
        screenOptions={{
          tabBarActiveTintColor: "#7F00FF",
          tabBarInactiveTintColor: "#9ab",
          tabBarIndicatorStyle: { backgroundColor: "#7F00FF" },
          tabBarStyle: { backgroundColor: "#14181c" },
        }}
      >
        <TopTab.Screen name="Me" component={MyActivityScreen} />
        <TopTab.Screen name="Friends" component={FriendsActivityScreen} />
      </TopTab.Navigator>
    </SafeAreaView>
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
