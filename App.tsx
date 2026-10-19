import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

import ProfileScreen from "./screens/ProfileScreen";
import FriendsScreen from "./screens/FriendsScreen";
import SearchScreen from "./screens/SearchScreen";
import HomeScreen from "./screens/HomeScreen";
import MovieDetailsScreen from "./screens/MovieDetailsScreen";
import LoginScreen from "./screens/LoginScreen";
import SettingsScreen from "./screens/SettingsScreen";
import type { RootStackParamList } from "./navigation/types";
import WatchlistScreen from "./screens/WatchlistScreen";
import DiaryScreen from "./screens/DiaryScreen";
import MySeriesScreen from "./screens/MySeriesScreen";
import UserProfileScreen from "./screens/UserProfileScreen";
import FollowListScreen from "./screens/FollowListScreen";

import { colors } from "./theme/colors";

const BottomTab = createBottomTabNavigator();
const RootStack = createNativeStackNavigator<RootStackParamList>();

function MainTabs() {
  return (
    <BottomTab.Navigator screenOptions={tabBarScreenOptions}>
      <BottomTab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: "Home",
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
        name="Watchlist"
        component={WatchlistScreen}
        options={{
          tabBarLabel: "Watchlist",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book" color={color} size={size} />
          ),
        }}
      />
      <BottomTab.Screen
        name="Friends"
        component={FriendsScreen}
        options={{
          tabBarLabel: "Friends",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" color={color} size={size} />
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
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <RootStack.Navigator>
          <RootStack.Screen
            name="Main"
            component={MainTabs}
            options={{ headerShown: false }}
          />
          <RootStack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <RootStack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{ title: "Settings", ...stackHeaderOptions }}
          />
          <RootStack.Screen
            name="MovieDetails"
            component={MovieDetailsScreen}
            options={{ title: "Details", ...stackHeaderOptions }}
          />
          <RootStack.Screen
            name="Diary"
            component={DiaryScreen}
            options={{ title: "Diary", ...stackHeaderOptions }}
          />
          <RootStack.Screen
            name="UserWatchlist"
            component={WatchlistScreen}
            options={{ title: "Watchlist", ...stackHeaderOptions }}
          />
          <RootStack.Screen
            name="MySeries"
            component={MySeriesScreen}
            options={{ title: "Series", ...stackHeaderOptions }}
          />
          <RootStack.Screen
            name="UserProfile"
            component={UserProfileScreen}
            options={{ title: "Profile", ...stackHeaderOptions }}
          />
          <RootStack.Screen
            name="FollowList"
            component={FollowListScreen}
            options={{ title: "Followers", ...stackHeaderOptions }}
          />
        </RootStack.Navigator>
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

// Header style of the pages opened on top of the tabs.
const stackHeaderOptions = {
  headerTintColor: colors.text,
  headerStyle: { backgroundColor: colors.background },
  headerTitleStyle: { color: colors.text },
};

const tabBarScreenOptions = {
  headerShown: false,
  tabBarActiveTintColor: colors.accent,
  tabBarInactiveTintColor: colors.textMuted,
  tabBarStyle: styles.tabBar,
  tabBarLabelStyle: styles.tabBarLabel,
};
