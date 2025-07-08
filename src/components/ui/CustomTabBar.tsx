import React from "react";
import { View, Pressable, Text, Platform } from "react-native";
import { useColorScheme } from "~/lib/utils/useColorScheme";
import { Home, BookOpen, Settings as SettingsIcon } from "lucide-react-native";

interface CustomTabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

const tabItems = [
  { name: "index", label: "Home", icon: Home },
  { name: "skills", label: "Skills", icon: BookOpen },
  { name: "settings", label: "Settings", icon: SettingsIcon },
];

export default function CustomTabBar({
  state,
  descriptors,
  navigation,
}: CustomTabBarProps) {
  const { isDarkColorScheme } = useColorScheme();
  const bottomPadding = Platform.OS === "ios" ? 25 : 15;

  return (
    <View
      style={{
        flexDirection: "row",
        backgroundColor: isDarkColorScheme ? "#0a0a0a" : "#ffffff",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: bottomPadding,
        shadowColor: "#000000",
        shadowOffset: {
          width: 0,
          height: -4,
        },
        shadowOpacity: isDarkColorScheme ? 0.4 : 0.08,
        shadowRadius: 16,
        elevation: 20,
        borderTopWidth: 0.5,
        borderTopColor: isDarkColorScheme ? "#2a2a2a" : "#f0f0f0",
      }}
    >
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        const tabItem = tabItems.find((item) => item.name === route.name);

        if (!tabItem) return null;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const IconComponent = tabItem.icon;

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 12,
              marginHorizontal: 4,
              borderRadius: 16,
              backgroundColor: isFocused
                ? isDarkColorScheme
                  ? "#1a1a1a"
                  : "#f8f9fa"
                : "transparent",
            }}
            android_ripple={{
              color: isDarkColorScheme ? "#ffffff20" : "#00000010",
              borderless: true,
            }}
          >
            <View
              style={{
                alignItems: "center",
                transform: [{ scale: isFocused ? 1.1 : 1 }],
              }}
            >
              <IconComponent
                size={isFocused ? 24 : 20}
                color={
                  isFocused
                    ? isDarkColorScheme
                      ? "#ffffff"
                      : "#000000"
                    : isDarkColorScheme
                      ? "#666666"
                      : "#999999"
                }
                strokeWidth={isFocused ? 2.5 : 2}
              />
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: isFocused ? "700" : "600",
                  color: isFocused
                    ? isDarkColorScheme
                      ? "#ffffff"
                      : "#000000"
                    : isDarkColorScheme
                      ? "#666666"
                      : "#999999",
                  marginTop: 4,
                  letterSpacing: 0.3,
                }}
              >
                {tabItem.label}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
