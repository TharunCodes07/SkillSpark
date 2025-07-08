import React, { useEffect, useState } from "react";
import { View, TextInput, Text } from "react-native";
import { fetchUserName, setUserName } from "~/queries/user-queries";

export default function NameSetting() {
  const [name, setName] = useState("");

  useEffect(() => {
    (async () => {
      const storedName = await fetchUserName();
      setName(storedName);
    })();
  }, []);

  const handleNameChange = async (text: string) => {
    setName(text);
    await setUserName(text);
  };

  return (
    <View className="mb-4">
      <Text className="text-lg font-semibold mb-2 text-black dark:text-white">
        Your Name
      </Text>
      <TextInput
        className="border p-2 rounded-md text-black dark:text-white border-gray-300 dark:border-gray-600"
        value={name}
        onChangeText={handleNameChange}
        placeholder="Enter your name"
        placeholderTextColor="#aaa"
      />
    </View>
  );
}
