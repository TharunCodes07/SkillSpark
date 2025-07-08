import React from "react";
import { Tabs } from "expo-router";
import { Pressable, View, Text } from "react-native";
import { useColorScheme } from "~/lib/utils/useColorScheme";
import { useClientOnlyValue } from "~/components/useClientOnlyValue";
import { Home, BookOpen, Settings as SettingsIcon } from "lucide-react-native";

function TabBarIcon({
  icon: Icon,
  color,
}: {
  icon: React.ElementType;
  color: string;
}) {
  return <Icon size={24} color={color} />;
}

export default function TabLayout() {
  const { colorScheme } = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: colorScheme === "dark" ? "#1c1c1e" : "#fff",
          borderTopColor: colorScheme === "dark" ? "#333" : "#e5e5e5",
          height: 60,
          paddingBottom: 5,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
        tabBarActiveTintColor: colorScheme === "dark" ? "#fff" : "#2f95dc",
        tabBarInactiveTintColor: "#8e8e93",
        headerShown: useClientOnlyValue(false, true),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <TabBarIcon icon={Home} color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="skills"
        options={{
          title: "My Skills",
          tabBarIcon: ({ color }) => (
            <TabBarIcon icon={BookOpen} color={color} />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => (
            <TabBarIcon icon={SettingsIcon} color={color} />
          ),
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
