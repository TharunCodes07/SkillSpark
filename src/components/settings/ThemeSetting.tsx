import React from "react";
import { View, Text, Switch } from "react-native";
import { useColorScheme } from "~/utils/useColorScheme";

export default function ThemeSetting() {
  const colorSchemeObj = useColorScheme();
  let colorScheme: string | undefined = undefined;
  let setColorScheme: ((scheme: string) => void) | undefined = undefined;

  if (
    colorSchemeObj &&
    typeof colorSchemeObj === "object" &&
    "colorScheme" in colorSchemeObj &&
    "setColorScheme" in colorSchemeObj
  ) {
    colorScheme = (colorSchemeObj as any).colorScheme;
    setColorScheme = (colorSchemeObj as any).setColorScheme;
  } else if (typeof colorSchemeObj === "string") {
    colorScheme = colorSchemeObj;
  }

  return (
    <View className="mb-4 flex-row justify-between items-center">
      <Text className="text-lg font-semibold text-black dark:text-white">
        Dark Mode
      </Text>
      <Switch
        value={colorScheme === "dark"}
        onValueChange={() =>
          setColorScheme &&
          setColorScheme(colorScheme === "dark" ? "light" : "dark")
        }
        disabled={!setColorScheme}
      />
    </View>
  );
}
