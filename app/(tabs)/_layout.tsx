import { Tabs } from "expo-router";
import React from "react";

import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HapticTab } from "@/components/haptic-tab";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor:
          Colors[colorScheme ?? "light"].tint,

        tabBarInactiveTintColor: "#737b8c",

        headerShown: false,

        tabBarButton: HapticTab,

        tabBarStyle: {
          // 54 = actual footer
          // insets.bottom = phone navigation safe area
          height: 54 + insets.bottom,

          paddingTop: 5,

          // Keep icons/text above Samsung 3-button navigation
          paddingBottom: insets.bottom,

          backgroundColor: "#FFFFFF",

          borderTopWidth: 1,
          borderTopColor: "#E6ECF3",

          elevation: 8,
        },

        tabBarItemStyle: {
          paddingTop: 0,
        },

        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "700",
          marginTop: 0,
        },

        tabBarIconStyle: {
          marginTop: 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",

          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="home-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="current-trip"
        options={{
          title: "Current Trip",

          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="bus-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="trip-history"
        options={{
          title: "History",

          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="time-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",

          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="settings-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}