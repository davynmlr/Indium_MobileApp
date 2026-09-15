import { View, Text, StyleSheet } from "react-native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { SafeAreaView } from "react-native-safe-area-context";
import MyActivityScreen from "./subscreens/MyActivityScreen";
import FriendsActivityScreen from "./subscreens/FriendsActivityScreen";

import { colors } from "../theme/colors";

const TopTab = createMaterialTopTabNavigator();

function ActivityScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <TopTab.Navigator screenOptions={topTabScreenOptions}>
        <TopTab.Screen name="Me" component={MyActivityScreen} />
        <TopTab.Screen name="Friends" component={FriendsActivityScreen} />
      </TopTab.Navigator>
    </SafeAreaView>
  );
}

export default ActivityScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  tabBar: {
    backgroundColor: colors.background,
  },
  indicator: {
    backgroundColor: colors.accent,
  },
});

const topTabScreenOptions = {
  tabBarActiveTintColor: colors.accent,
  tabBarInactiveTintColor: colors.textMuted,
  tabBarIndicatorStyle: styles.indicator,
  tabBarStyle: styles.tabBar,
};
