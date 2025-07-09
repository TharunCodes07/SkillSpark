import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Card } from "~/components/ui/card";
import Icon from "~/lib/icons/Icon";
import { useColorScheme } from "~/lib/utils/useColorScheme";
import {
  getRoadmapById,
  updateRoadmapProgress,
  setActiveRoadmap,
  Roadmap,
  RoadmapPoint,
} from "~/queries/roadmap-queries";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
} from "react-native-reanimated";

export default function RoadmapDetailScreen() {
  const { roadmapId } = useLocalSearchParams<{ roadmapId: string }>();
  const router = useRouter();
  const { isDarkColorScheme } = useColorScheme();

  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRoadmap();
  }, [roadmapId]);

  const loadRoadmap = async () => {
    if (!roadmapId) return;

    try {
      const roadmapData = await getRoadmapById(roadmapId);
      setRoadmap(roadmapData);
    } catch (error) {
      console.error("Error loading roadmap:", error);
      Alert.alert("Error", "Failed to load roadmap details");
    } finally {
      setLoading(false);
    }
  };

  const handlePointPress = async (point: RoadmapPoint) => {
    if (!roadmap) return;

    // Set this roadmap as active and navigate to point detail
    try {
      await setActiveRoadmap(roadmap);
      router.push({
        pathname: "/roadmap-point",
        params: {
          roadmapId: roadmap.id,
          pointId: point.id,
          topic: roadmap.topic,
        },
      });
    } catch (error) {
      console.error("Error setting active roadmap:", error);
      Alert.alert("Error", "Failed to open roadmap point");
    }
  };

  const handleToggleComplete = async (point: RoadmapPoint) => {
    if (!roadmap) return;

    try {
      await updateRoadmapProgress(roadmap.id, point.id, !point.isCompleted);
      // Reload roadmap to get updated progress
      await loadRoadmap();
    } catch (error) {
      console.error("Error updating progress:", error);
      Alert.alert("Error", "Failed to update progress");
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "beginner":
        return "#22c55e";
      case "intermediate":
        return "#f59e0b";
      case "advanced":
        return "#ef4444";
      default:
        return "#6366f1";
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case "beginner":
        return "Play";
      case "intermediate":
        return "Zap";
      case "advanced":
        return "Star";
      default:
        return "Circle";
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center">
          <Text className="text-lg text-muted-foreground">
            Loading roadmap...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!roadmap) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center">
          <Text className="text-lg text-muted-foreground">
            Roadmap not found
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="mt-4 px-6 py-2 bg-primary rounded-lg"
          >
            <Text className="text-white font-medium">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const completedPoints =
    roadmap.points?.filter((point) => point.isCompleted).length || 0;
  const totalPoints = roadmap.points?.length || 0;
  const progressPercentage =
    totalPoints > 0 ? Math.round((completedPoints / totalPoints) * 100) : 0;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="p-6 pb-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="flex-row items-center mb-4"
          >
            <Icon name="ArrowLeft" size={24} color="#6366f1" />
            <Text className="text-lg font-medium text-primary ml-2">Back</Text>
          </TouchableOpacity>

          <Text className="text-3xl font-bold text-foreground mb-2">
            {roadmap.topic}
          </Text>
          <Text className="text-base text-muted-foreground mb-4">
            {roadmap.description}
          </Text>

          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Icon name="Target" size={20} color="#6366f1" />
              <Text className="text-base font-medium text-foreground ml-2">
                {completedPoints}/{totalPoints} completed
              </Text>
            </View>
            <Text className="text-lg font-bold text-primary">
              {progressPercentage}%
            </Text>
          </View>

          {/* Progress Bar */}
          <View className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-3">
            <View
              className="h-2 bg-primary rounded-full"
              style={{ width: `${progressPercentage}%` }}
            />
          </View>
        </View>

        {/* Roadmap Points */}
        <View className="px-6">
          <Text className="text-xl font-bold text-foreground mb-4">
            Learning Path
          </Text>

          {roadmap.points?.map((point, index) => (
            <RoadmapPointCard
              key={point.id}
              point={point}
              index={index}
              onPress={() => handlePointPress(point)}
              onToggleComplete={() => handleToggleComplete(point)}
              delay={index * 100}
            />
          ))}
        </View>

        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
  );
}

interface RoadmapPointCardProps {
  point: RoadmapPoint;
  index: number;
  onPress: () => void;
  onToggleComplete: () => void;
  delay: number;
}

function RoadmapPointCard({
  point,
  index,
  onPress,
  onToggleComplete,
  delay,
}: RoadmapPointCardProps) {
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(30);

  useEffect(() => {
    const timer = setTimeout(() => {
      scale.value = withDelay(
        delay,
        withSpring(1, { damping: 15, stiffness: 150 })
      );
      opacity.value = withDelay(delay, withTiming(1, { duration: 500 }));
      translateY.value = withDelay(
        delay,
        withSpring(0, { damping: 15, stiffness: 100 })
      );
    }, 50);

    return () => clearTimeout(timer);
  }, [delay]);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const getLevelColor = (level: string) => {
    switch (level) {
      case "beginner":
        return "#22c55e";
      case "intermediate":
        return "#f59e0b";
      case "advanced":
        return "#ef4444";
      default:
        return "#6366f1";
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case "beginner":
        return "Play";
      case "intermediate":
        return "Zap";
      case "advanced":
        return "Star";
      default:
        return "Circle";
    }
  };

  return (
    <Animated.View style={cardStyle} className="mb-4">
      <Card
        className={`p-4 border ${point.isCompleted ? "border-green-500" : "border-border"} bg-card`}
      >
        <View className="flex-row items-start">
          <View className="mr-4">
            <View
              className="w-8 h-8 rounded-full items-center justify-center mb-2"
              style={{ backgroundColor: `${getLevelColor(point.level)}20` }}
            >
              <Text
                className="text-sm font-bold"
                style={{ color: getLevelColor(point.level) }}
              >
                {index + 1}
              </Text>
            </View>
            <TouchableOpacity
              onPress={onToggleComplete}
              className={`w-8 h-8 rounded-full items-center justify-center ${
                point.isCompleted
                  ? "bg-green-500"
                  : "bg-gray-200 dark:bg-gray-700"
              }`}
            >
              <Icon
                name={point.isCompleted ? "Check" : "Circle"}
                size={16}
                color={point.isCompleted ? "#ffffff" : "#6b7280"}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={onPress} className="flex-1">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-lg font-bold text-foreground flex-1 mr-2">
                {point.title}
              </Text>
              <View
                className="px-2 py-1 rounded-full"
                style={{ backgroundColor: `${getLevelColor(point.level)}20` }}
              >
                <Text
                  className="text-xs font-semibold capitalize"
                  style={{ color: getLevelColor(point.level) }}
                >
                  {point.level}
                </Text>
              </View>
            </View>

            <Text className="text-sm text-muted-foreground mb-3">
              {point.description}
            </Text>

            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Icon
                  name={getLevelIcon(point.level) as any}
                  size={14}
                  color={getLevelColor(point.level)}
                />
                <Text
                  className="text-xs font-medium ml-1"
                  style={{ color: getLevelColor(point.level) }}
                >
                  {point.level} level
                </Text>
              </View>

              <View className="flex-row items-center">
                <Text className="text-sm font-medium text-primary mr-1">
                  View Resources
                </Text>
                <Icon name="ArrowRight" size={14} color="#6366f1" />
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </Card>
    </Animated.View>
  );
}
