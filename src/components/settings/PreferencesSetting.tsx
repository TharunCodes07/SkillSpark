import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { fetchUser, setUserPreferences } from "~/queries/user-queries";

export default function PreferencesSetting() {
  const [depth, setDepth] = useState("Balanced");
  const [videoLength, setVideoLength] = useState("Medium");

  useEffect(() => {
    (async () => {
      const user = await fetchUser();
      if (user?.preferences) {
        setDepth(user.preferences.depth || "Balanced");
        setVideoLength(user.preferences.videoLength || "Medium");
      }
    })();
  }, []);

  const updatePreferences = async (key: string, value: string) => {
    const newPreferences = { depth, videoLength, [key]: value };
    if (key === "depth") setDepth(value);
    if (key === "videoLength") setVideoLength(value);
    await setUserPreferences(newPreferences);
  };

  return (
    <View className="mb-4">
      <Text className="text-lg font-semibold mb-2 text-black dark:text-white">
        Default Roadmap Depth
      </Text>
      <Picker
        selectedValue={depth}
        onValueChange={(itemValue: string) =>
          updatePreferences("depth", itemValue)
        }
        style={{ color: "black" }}
      >
        <Picker.Item label="Fast & Short" value="Fast" />
        <Picker.Item label="Balanced" value="Balanced" />
        <Picker.Item label="Detailed & Deep" value="Detailed" />
      </Picker>

      <Text className="text-lg font-semibold mb-2 mt-4 text-black dark:text-white">
        Default Video Length
      </Text>
      <Picker
        selectedValue={videoLength}
        onValueChange={(itemValue: string) =>
          updatePreferences("videoLength", itemValue)
        }
        style={{ color: "black" }}
      >
        <Picker.Item label="Short" value="Short" />
        <Picker.Item label="Medium" value="Medium" />
        <Picker.Item label="Long" value="Long" />
      </Picker>
    </View>
  );
}
