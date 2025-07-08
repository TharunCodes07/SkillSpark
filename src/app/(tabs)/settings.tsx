import React from "react";
import { View, ScrollView, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import NameSetting from "~/components/settings/NameSetting";
import DescriptionSetting from "~/components/settings/DescriptionSetting";
import ThemeSetting from "~/components/settings/ThemeSetting";
import PreferencesSetting from "~/components/settings/PreferencesSetting";
import ClearDataSetting from "~/components/settings/ClearDataSetting";
import AppInfoSetting from "~/components/settings/AppInfoSetting";
import SectionHeader from "~/components/ui/SectionHeader";

export default function SettingsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1">
        <View className="bg-card px-6 pt-16 py-4 border-b border-border">
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
  );
}
