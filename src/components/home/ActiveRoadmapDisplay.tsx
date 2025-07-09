import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Card } from "~/components/ui/card";
import Icon from "~/lib/icons/Icon";
import {
  Roadmap,
  getActiveRoadmap,
  updateRoadmapProgress,
} from "~/queries/roadmap-queries";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolate,
  Easing,
} from "react-native-reanimated";

interface ActiveRoadmapDisplayProps {
  refreshTrigger?: number;
  onProgressUpdate?: () => void; // Add callback for progress updates
}

export default function ActiveRoadmapDisplay({
  refreshTrigger,
  onProgressUpdate,
}: ActiveRoadmapDisplayProps) {
  const [activeRoadmap, setActiveRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fadeIn = useSharedValue(0);
  const slideY = useSharedValue(30);
  const progressWidth = useSharedValue(0);
  const progressBounce = useSharedValue(1);

  useEffect(() => {
    loadActiveRoadmap();
  }, [refreshTrigger]);

  const loadActiveRoadmap = async () => {
    try {
      setLoading(true);
      const roadmap = await getActiveRoadmap();
      setActiveRoadmap(roadmap);

      // Animate entrance
      fadeIn.value = withTiming(1, {
        duration: 600,
        easing: Easing.out(Easing.quad),
      });
      slideY.value = withTiming(0, {
        duration: 600,
        easing: Easing.out(Easing.quad),
      });

      // Animate progress bar
      if (roadmap?.progress) {
        progressWidth.value = withTiming(roadmap.progress.percentage, {
          duration: 1000,
          easing: Easing.out(Easing.quad),
        });
      }
    } catch (error) {
      console.error("Error loading active roadmap:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCompletion = async (
    pointId: string,
    currentStatus: boolean
  ) => {
    if (!activeRoadmap) return;

    try {
      const newStatus = !currentStatus;
      await updateRoadmapProgress(activeRoadmap.id, pointId, newStatus);

      // Update local state immediately for better UX
      setActiveRoadmap((prev) => {
        if (!prev || !Array.isArray(prev.points)) return prev;

        const updatedPoints = prev.points.map((point) =>
          point.id === pointId ? { ...point, isCompleted: newStatus } : point
        );

        // Recalculate progress
        const completedPoints = updatedPoints.filter(
          (point) => point && point.isCompleted
        ).length;
        const totalPoints = updatedPoints.length;
        const percentage =
          totalPoints > 0
            ? Math.round((completedPoints / totalPoints) * 100)
            : 0;

        const updatedRoadmap = {
          ...prev,
          points: updatedPoints,
          progress: {
            completedPoints,
            totalPoints,
            percentage,
          },
        };

        // Animate progress bar update
        progressWidth.value = withTiming(percentage, {
          duration: 1000,
          easing: Easing.out(Easing.quad),
        });

        // Add bounce animation to progress section
        progressBounce.value = withSpring(
          1.05,
          { damping: 15, stiffness: 200 },
          () => {
            progressBounce.value = withSpring(1, {
              damping: 15,
              stiffness: 200,
            });
          }
        );

        return updatedRoadmap;
      });

      // Notify parent component about progress update
      onProgressUpdate?.();
    } catch (error) {
      console.error("Error updating progress:", error);
      // Reload data if update fails
      await loadActiveRoadmap();
    }
  };

  const handlePointPress = (pointId: string) => {
    if (!activeRoadmap) return;

    router.push({
      pathname: "/roadmap-point",
      params: {
        roadmapId: activeRoadmap.id,
        pointId: pointId,
      },
    });
  };

  const containerStyle = useAnimatedStyle(() => ({
    opacity: fadeIn.value,
    transform: [{ translateY: slideY.value }],
  }));

  const progressBarStyle = useAnimatedStyle(() => ({
    width: `${interpolate(progressWidth.value, [0, 100], [0, 100])}%`,
  }));

  const progressSectionStyle = useAnimatedStyle(() => ({
    transform: [{ scale: progressBounce.value }],
  }));

  if (loading) {
    return (
      <View className="mx-6 mb-6">
        <Card className="p-6 bg-card border border-border">
          <View className="flex-row items-center justify-center py-8">
            <Icon name="Loader" size={24} color="#6b7280" />
            <Text className="ml-2 text-muted-foreground">
              Loading roadmap...
            </Text>
          </View>
        </Card>
      </View>
    );
  }

  if (!activeRoadmap) {
    return (
      <View className="mx-6 mb-6">
        <Card className="p-6 bg-card border border-border">
          <View className="items-center py-8">
            <View className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full items-center justify-center mb-4">
              <Icon name="BookOpen" size={24} color="#6b7280" />
            </View>
            <Text className="text-lg font-semibold text-foreground mb-2">
              No Active Roadmap
            </Text>
            <Text className="text-sm text-muted-foreground text-center">
              Generate your first roadmap to start your learning journey
            </Text>
          </View>
        </Card>
      </View>
    );
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case "beginner":
        return "#22c55e";
      case "intermediate":
        return "#f59e0b";
      case "advanced":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const getLevelBgColor = (level: string) => {
    switch (level) {
      case "beginner":
        return "bg-green-50 dark:bg-green-900/20";
      case "intermediate":
        return "bg-yellow-50 dark:bg-yellow-900/20";
      case "advanced":
        return "bg-red-50 dark:bg-red-900/20";
      default:
        return "bg-gray-50 dark:bg-gray-900/20";
    }
  };

  return (
    <Animated.View style={containerStyle} className="mx-6 mb-6">
      <Card className="p-6 bg-card border border-border ml-4 mr-4">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-1">
            <Text className="text-xl font-bold text-foreground">
              {activeRoadmap.title}
            </Text>
            <Text className="text-sm text-muted-foreground mt-1">
              {activeRoadmap.description}
            </Text>
          </View>
          <View className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-full items-center justify-center">
            <Icon name="BookOpen" size={20} color="#6366f1" />
          </View>
        </View>

        {/* Progress Section */}
        <Animated.View style={progressSectionStyle} className="mb-6">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-sm font-medium text-foreground">
              Overall Progress
            </Text>
            <Text className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
              {activeRoadmap.progress?.percentage || 0}%
            </Text>
          </View>

          <View className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <Animated.View
              style={progressBarStyle}
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"
            />
          </View>

          <Text className="text-xs text-muted-foreground mt-1">
            {activeRoadmap.progress?.completedPoints || 0} of{" "}
            {activeRoadmap.progress?.totalPoints || 0} sections completed
          </Text>
        </Animated.View>

        {/* Learning Points */}
        <View>
          <Text className="text-lg font-semibold text-foreground mb-3">
            Learning Path
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="space-x-3"
          >
            {activeRoadmap.points && Array.isArray(activeRoadmap.points) ? (
              activeRoadmap.points.map((point, index) => (
                <TouchableOpacity
                  key={point.id}
                  onPress={() => handlePointPress(point.id)}
                  className="w-64 mr-3"
                >
                  <Card
                    className={`p-4 border ${point.isCompleted ? "border-green-300 bg-green-50 dark:bg-green-900/20" : "border-border bg-card"} ${point.playlists === null ? "border-dashed border-orange-300" : ""}`}
                  >
                    <View className="flex-row items-start justify-between mb-2">
                      <View className="flex-1">
                        <View className="flex-row items-center mb-1">
                          <Text
                            className={`text-xs font-medium px-2 py-1 rounded-full ${getLevelBgColor(point.level)}`}
                            style={{ color: getLevelColor(point.level) }}
                          >
                            {point.level.toUpperCase()}
                          </Text>
                          <Text className="text-xs text-muted-foreground ml-2">
                            Step {point.order}
                          </Text>
                          {point.playlists === null && (
                            <View className="ml-2 w-2 h-2 bg-orange-400 rounded-full" />
                          )}
                        </View>
                        <Text className="text-sm font-semibold text-foreground">
                          {point.title}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={(e) => {
                          e.stopPropagation(); // Prevent triggering parent onPress
                          handleToggleCompletion(
                            point.id,
                            point.isCompleted || false
                          );
                        }}
                        className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                          point.isCompleted
                            ? "border-green-500 bg-green-500"
                            : "border-gray-300 dark:border-gray-600"
                        }`}
                      >
                        {point.isCompleted && (
                          <Icon name="Check" size={12} color="#ffffff" />
                        )}
                      </TouchableOpacity>
                    </View>

                    <Text
                      className="text-xs text-muted-foreground mb-3"
                      numberOfLines={2}
                    >
                      {point.description}
                    </Text>

                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center">
                        <Icon name="Play" size={12} color="#6b7280" />
                        <Text className="text-xs text-muted-foreground ml-1">
                          {point.playlists
                            ? `${point.playlists.length} videos`
                            : "Tap to explore"}
                        </Text>
                      </View>
                      <View className="flex-row items-center">
                        <Text
                          className={`text-xs font-medium mr-2 ${
                            point.isCompleted
                              ? "text-green-600 dark:text-green-400"
                              : "text-muted-foreground"
                          }`}
                        >
                          {point.isCompleted ? "Completed" : "In Progress"}
                        </Text>
                        <Icon name="ChevronRight" size={12} color="#6b7280" />
                      </View>
                    </View>
                  </Card>
                </TouchableOpacity>
              ))
            ) : (
              <View className="w-64 mr-3">
                <Card className="p-4 border border-border bg-card">
                  <Text className="text-sm text-muted-foreground text-center">
                    No learning points available
                  </Text>
                </Card>
              </View>
            )}
          </ScrollView>
        </View>

        {/* Footer */}
        <View className="mt-6 pt-4 border-t border-border">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Icon name="Calendar" size={16} color="#6b7280" />
              <Text className="text-xs text-muted-foreground ml-1">
                Created {new Date(activeRoadmap.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>
      </Card>
    </Animated.View>
  );
}
