import React from "react";
import { View, Text } from "react-native";

export default function AppInfoSetting() {
  return (
    <View className="mb-6">
      <View className="space-y-0">
        <View className="flex-row justify-between items-center py-3">
          <Text className="text-base font-medium text-foreground">Version</Text>
          <Text className="text-sm text-muted-foreground">1.0.0</Text>
        </View>
        <View className="h-px bg-border ml-0" />
        <View className="flex-row justify-between items-center py-3">
          <Text className="text-base font-medium text-foreground">Build</Text>
          <Text className="text-sm text-muted-foreground">2025.1.1</Text>
        </View>
      </View>
    </View>
  );
}
