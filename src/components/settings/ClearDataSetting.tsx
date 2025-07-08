import React from "react";
import { View, Text, Pressable, Alert } from "react-native";
import { clearUserData } from "~/queries/user-queries";

export default function ClearDataSetting() {
  const handleClearData = () => {
    Alert.alert(
      "Clear All Data",
      "Are you sure you want to clear all your saved data?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            await clearUserData();
            Alert.alert("Data cleared successfully.");
          },
        },
      ]
    );
  };

  return (
    <View className="mb-4">
      <Pressable
        className="bg-red-500 py-3 rounded-md items-center"
        onPress={handleClearData}
      >
        <Text className="text-white font-semibold">Clear All Data</Text>
      </Pressable>
    </View>
  );
}
