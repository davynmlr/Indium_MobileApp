import { View, Text, StyleSheet } from "react-native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { SafeAreaView } from "react-native-safe-area-context";
import FilmsScreen from "./subscreens/FilmsScreen";
import SeriesScreen from "./subscreens/SeriesScreen";

const TopTab = createMaterialTopTabNavigator();
export default function HomeScreen() {
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
        <TopTab.Screen name="Films" component={FilmsScreen} />
        <TopTab.Screen name="Series" component={SeriesScreen} />
      </TopTab.Navigator>
    </SafeAreaView>
  );
}
