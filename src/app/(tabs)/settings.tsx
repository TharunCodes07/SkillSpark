import React, { useEffect } from "react";
import { View, ScrollView, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from "react-native-reanimated";
import NameSetting from "~/components/settings/NameSetting";
import DescriptionSetting from "~/components/settings/DescriptionSetting";
import ThemeSetting from "~/components/settings/ThemeSetting";
import PreferencesSetting from "~/components/settings/PreferencesSetting";
import ClearDataSetting from "~/components/settings/ClearDataSetting";
import SectionHeader from "~/components/ui/SectionHeader";
import { DataRefreshProvider } from "~/lib/utils/DataRefreshContext";
import { useColorScheme } from "~/lib/utils/useColorScheme";

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export default function SettingsScreen() {
  const { isDarkColorScheme } = useColorScheme();
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    // Gradient pulse animation
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.02, { duration: 3000, easing: Easing.inOut(Easing.quad) }),
        withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      false
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  // Theme-aware gradient colors
  const gradientColors = isDarkColorScheme
    ? ([
        "rgba(99, 102, 241, 0.15)", // Indigo
        "rgba(168, 85, 247, 0.12)", // Purple
        "rgba(236, 72, 153, 0.08)", // Pink
        "rgba(59, 130, 246, 0.05)", // Blue
        "transparent",
      ] as const)
    : ([
        "rgba(99, 102, 241, 0.03)", // Very subtle indigo
        "rgba(168, 85, 247, 0.02)", // Very subtle purple
        "rgba(59, 130, 246, 0.02)", // Very subtle blue
        "rgba(236, 72, 153, 0.01)", // Very subtle pink
        "transparent",
      ] as const);

  return (
    <DataRefreshProvider>
      <View className="flex-1">
        {/* Theme-aware Animated Background Gradient */}
        <AnimatedLinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            pulseStyle,
            {
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            },
          ]}
        />

        <SafeAreaView className="flex-1 bg-transparent">
          <ScrollView className="flex-1">
            <View className="bg-card px-6 pt-8 py-4 border-b border-border">
              <Text className="text-4xl font-bold text-foreground mt-3">
                Settings
              </Text>
              <Text className="text-base text-muted-foreground">
                Manage your preferences and account settings
              </Text>
            </View>

            <View className="px-6 py-6">
              <SectionHeader
                title="Personal Information"
                subtitle="Tell us about yourself to personalize your experience"
              />
              <View className="px-3">
                <NameSetting />
                <View className="h-px bg-border mb-1" />
                <DescriptionSetting />
              </View>

              <View className="h-px bg-border mb-4" />
              <SectionHeader
                title="Appearance"
                subtitle="Customize how the app looks and feels"
              />
              <View className="mb-1 px-3">
                <ThemeSetting />
              </View>

              <View className="h-px bg-border mb-4" />

              <SectionHeader
                title="Learning Preferences"
                subtitle="Set your default learning options"
              />
              <View className="mb-1 px-3">
                <PreferencesSetting />
              </View>

              <View className="h-px bg-border mb-4" />

              <SectionHeader
                title="Data Management"
                subtitle="Manage your stored information"
              />
              <View className="mb-1 px-3">
                <ClearDataSetting />
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    </DataRefreshProvider>
  );
}
