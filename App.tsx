import { StyleSheet, Text, View, Button } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import ProfileScreen from "./screens/ProfileScreen";
import ActivityScreen from "./screens/ActivityScreen";
import SearchScreen from "./screens/SearchScreen";
import AddMovieScreen from "./screens/AddMovieScreen";
import Ionicons from "@expo/vector-icons/Ionicons";
import HomeScreen from "./screens/HomeScreen";

const BottomTab = createBottomTabNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <BottomTab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: "#7F00FF",
            tabBarInactiveTintColor: "#9ab8c4",
            tabBarStyle: {
              backgroundColor: "#14181c",
              borderTopColor: "#2c3440",
              borderTopWidth: 1,
              height: 100,
              paddingBottom: 8,
              paddingTop: 8,
            },
            tabBarLabelStyle: {
              fontSize: 11,
              fontWeight: "600",
            },
          }}
        >
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
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
