import React from "react";
import { View, ScrollView } from "react-native";
import NameSetting from "~/components/settings/NameSetting";
import ThemeSetting from "~/components/settings/ThemeSetting";
import PreferencesSetting from "~/components/settings/PreferencesSetting";
import ClearDataSetting from "~/components/settings/ClearDataSetting";

export default function SettingsScreen() {
  return (
    <ScrollView className="flex-1 p-4 bg-white dark:bg-black">
      <NameSetting />
      <ThemeSetting />
      <PreferencesSetting />
      <ClearDataSetting />
    </ScrollView>
  );
}
