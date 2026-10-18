import { StyleSheet } from "react-native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { SafeAreaView } from "react-native-safe-area-context";
import MyActivityScreen from "./subscreens/MyActivityScreen";
import FriendsActivityScreen from "./subscreens/FriendsActivityScreen";
import { colors } from "../theme/colors";
import { topTabScreenOptions } from "../theme/topTabs";

const TopTab = createMaterialTopTabNavigator();

export default function ActivityScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <TopTab.Navigator screenOptions={topTabScreenOptions}>
        <TopTab.Screen name="Me" component={MyActivityScreen} />
        <TopTab.Screen name="Friends" component={FriendsActivityScreen} />
      </TopTab.Navigator>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
