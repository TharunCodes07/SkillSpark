import React, { useState } from "react";
import { View, Text, TextInput, Alert } from "react-native";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import Icon from "~/lib/icons/Icon";
import { useColorScheme } from "~/lib/utils/useColorScheme";
import {
  generateNewRoadmap,
  createMockRoadmap,
  setActiveRoadmap,
} from "~/queries/roadmap-queries";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
  runOnJS,
} from "react-native-reanimated";

interface RoadmapGeneratorProps {
  onRoadmapGenerated?: () => void;
}

export default function RoadmapGenerator({
  onRoadmapGenerated,
}: RoadmapGeneratorProps) {
  const [topic, setTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { isDarkColorScheme } = useColorScheme();

  const buttonScale = useSharedValue(1);
  const inputFocus = useSharedValue(0);
  const cardScale = useSharedValue(1);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      Alert.alert(
        "Missing Topic",
        "Please enter a topic to generate a roadmap."
      );
      return;
    }

    setIsGenerating(true);
    buttonScale.value = withSpring(0.95);

    try {
      // Since backend is not ready, use mock data
      // Replace this with: await generateNewRoadmap(topic.trim());
      const mockRoadmap = createMockRoadmap(topic.trim());
      await setActiveRoadmap(mockRoadmap);

      // Animate success
      cardScale.value = withTiming(1.05, { duration: 200 }, () => {
        cardScale.value = withTiming(1, { duration: 200 });
      });

      Alert.alert(
        "Success!",
        `Generated roadmap for "${topic}". Check it out below!`,
        [
          {
            text: "OK",
            onPress: () => {
              setTopic("");
              onRoadmapGenerated?.();
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to generate roadmap. Please try again.");
      console.error("Error generating roadmap:", error);
    } finally {
      setIsGenerating(false);
      buttonScale.value = withSpring(1);
    }
  };

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const inputStyle = useAnimatedStyle(() => {
    const focusedBorderColor = isDarkColorScheme ? "#6366f1" : "#4f46e5";
    const unfocusedBorderColor = isDarkColorScheme ? "#374151" : "#e5e7eb";

    return {
      borderWidth: withTiming(inputFocus.value > 0 ? 2 : 1, { duration: 200 }),
      borderColor: withTiming(
        inputFocus.value > 0 ? focusedBorderColor : unfocusedBorderColor,
        { duration: 200 }
      ),
    };
  });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
  }));

  return (
    <Animated.View style={cardStyle}>
      <Card className="mx-6 mb-6 p-6 bg-card border border-border">
        <View className="flex-row items-center mb-4">
          <View className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-full items-center justify-center mr-3">
            <Icon name="Plus" size={20} color="#6366f1" />
          </View>
          <View className="flex-1">
            <Text className="text-xl font-bold text-foreground">
              Generate Roadmap
            </Text>
            <Text className="text-sm text-muted-foreground">
              Enter any topic to create a personalized learning path
            </Text>
          </View>
        </View>

        <View className="space-y-4">
          <View className="mb-4">
            <Text className="text-sm font-medium text-foreground mb-2">
              Learning Topic
            </Text>
            <Animated.View
              style={[
                inputStyle,
                {
                  borderRadius: 12,
                  backgroundColor: isDarkColorScheme ? "#1f2937" : "#ffffff",
                },
              ]}
            >
              <TextInput
                value={topic}
                onChangeText={setTopic}
                placeholder="e.g., React Native, Python, Machine Learning..."
                placeholderTextColor={isDarkColorScheme ? "#9CA3AF" : "#6B7280"}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  fontSize: 16,
                  color: isDarkColorScheme ? "#f9fafb" : "#374151",
                  borderRadius: 12,
                }}
                onFocus={() => {
                  inputFocus.value = withTiming(1, { duration: 200 });
                }}
                onBlur={() => {
                  inputFocus.value = withTiming(0, { duration: 200 });
                }}
                editable={!isGenerating}
              />
            </Animated.View>
          </View>

          <Animated.View style={buttonStyle}>
            <Button
              onPress={handleGenerate}
              disabled={isGenerating || !topic.trim()}
              style={{
                backgroundColor: isGenerating ? "#9CA3AF" : "#4F46E5",
                paddingVertical: 16,
                borderRadius: 12,
                width: "100%",
              }}
            >
              <View className="flex-row items-center justify-center">
                {isGenerating && (
                  <View className="mr-2">
                    <Icon name="Loader" size={20} color="#ffffff" />
                  </View>
                )}
                <Text className="text-white font-semibold text-base">
                  <Icon name="Wand" size={20} color="#ffffff" />
                  {isGenerating ? "Generating..." : "Generate Roadmap"}
                </Text>
              </View>
            </Button>
          </Animated.View>
        </View>

        <View className="mt-4 pt-4 border-t border-border">
          <Text className="text-xs text-muted-foreground text-center">
            💡 Try topics like "React Native", "Data Science", "UI/UX Design"
          </Text>
        </View>
      </Card>
    </Animated.View>
  );
}
