import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

import ProfileScreen from "./screens/ProfileScreen";
import ActivityScreen from "./screens/ActivityScreen";
import SearchScreen from "./screens/SearchScreen";
import AddMovieScreen from "./screens/AddMovieScreen";
import HomeScreen from "./screens/HomeScreen";

import { colors } from "./theme/colors";

const BottomTab = createBottomTabNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <BottomTab.Navigator screenOptions={tabBarScreenOptions}>
          <BottomTab.Screen
            name="Movies"
            component={HomeScreen}
            options={{
              tabBarLabel: "Movies",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="film" color={color} size={size} />
              ),
            }}
          />
          <BottomTab.Screen
            name="Search"
            component={SearchScreen}
            options={{
              tabBarLabel: "Search",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="search" color={color} size={size} />
              ),
            }}
          />
          <BottomTab.Screen
            name="AddMovie"
            component={AddMovieScreen}
            options={{
              tabBarLabel: "Add Movie",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="add" color={color} size={size} />
              ),
            }}
          />
          <BottomTab.Screen
            name="Activity"
            component={ActivityScreen}
            options={{
              tabBarLabel: "Activity",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="list" color={color} size={size} />
              ),
            }}
          />
          <BottomTab.Screen
            name="Profile"
            component={ProfileScreen}
            options={{
              tabBarLabel: "Profile",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="person" color={color} size={size} />
              ),
            }}
          />
        </BottomTab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.background,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    height: 80,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: "600",
  },
});

const tabBarScreenOptions = {
  headerShown: false,
  tabBarActiveTintColor: colors.accent,
  tabBarInactiveTintColor: colors.textMuted,
  tabBarStyle: styles.tabBar,
  tabBarLabelStyle: styles.tabBarLabel,
};
