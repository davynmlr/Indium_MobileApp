import { StyleSheet } from "react-native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { SafeAreaView } from "react-native-safe-area-context";
import FilmsScreen from "./subscreens/FilmsScreen";
import SeriesScreen from "./subscreens/SeriesScreen";
import { colors } from "../theme/colors";
import { topTabScreenOptions } from "../theme/topTabs";

const TopTab = createMaterialTopTabNavigator();

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <TopTab.Navigator screenOptions={topTabScreenOptions}>
        <TopTab.Screen name="Films" component={FilmsScreen} />
        <TopTab.Screen name="Series" component={SeriesScreen} />
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
