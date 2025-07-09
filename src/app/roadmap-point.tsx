import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import Icon from "~/lib/icons/Icon";
import {
  getRoadmapById,
  updateRoadmapProgress,
  loadPlaylistsForPoint,
  arePlaylistsLoadedForPoint,
  RoadmapPoint,
  PlaylistItem,
} from "~/queries/roadmap-queries";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  Easing,
} from "react-native-reanimated";

export default function RoadmapPointScreen() {
  const { roadmapId, pointId } = useLocalSearchParams<{
    roadmapId: string;
    pointId: string;
  }>();
  const router = useRouter();

  const [point, setPoint] = useState<RoadmapPoint | null>(null);
  const [playlists, setPlaylists] = useState<PlaylistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPlaylists, setLoadingPlaylists] = useState(false);
  const [roadmapTopic, setRoadmapTopic] = useState("");

  const fadeIn = useSharedValue(0);
  const slideY = useSharedValue(50);
  const headerScale = useSharedValue(0.9);

  useEffect(() => {
    loadPointData();
  }, []);

  useEffect(() => {
    if (point) {
      // Animate entrance
      fadeIn.value = withTiming(1, {
        duration: 600,
        easing: Easing.out(Easing.quad),
      });
      slideY.value = withTiming(0, {
        duration: 600,
        easing: Easing.out(Easing.quad),
      });
      headerScale.value = withSpring(1, { damping: 15, stiffness: 200 });
    }
  }, [point]);

  const loadPointData = async () => {
    if (!roadmapId || !pointId) return;

    try {
      setLoading(true);
      const roadmap = await getRoadmapById(roadmapId);
      if (!roadmap) {
        Alert.alert("Error", "Roadmap not found");
        router.back();
        return;
      }

      const foundPoint = roadmap.points.find((p) => p.id === pointId);
      if (!foundPoint) {
        Alert.alert("Error", "Roadmap point not found");
        router.back();
        return;
      }

      setPoint(foundPoint);
      setRoadmapTopic(roadmap.topic);

      // Check if playlists are loaded, if not load them
      await loadPlaylists(foundPoint, roadmap.topic);
    } catch (error) {
      console.error("Error loading point data:", error);
      Alert.alert("Error", "Failed to load roadmap point");
    } finally {
      setLoading(false);
    }
  };

  const loadPlaylists = async (pointData: RoadmapPoint, topic: string) => {
    if (!roadmapId || !pointId) return;

    try {
      setLoadingPlaylists(true);

      const areLoaded = await arePlaylistsLoadedForPoint(roadmapId, pointId);

      if (areLoaded && pointData.playlists) {
        setPlaylists(pointData.playlists);
      } else {
        // Load playlists from backend
        const loadedPlaylists = await loadPlaylistsForPoint(
          roadmapId,
          pointId,
          topic,
          pointData.title
        );
        setPlaylists(loadedPlaylists);
      }
    } catch (error) {
      console.error("Error loading playlists:", error);
      Alert.alert("Error", "Failed to load playlists");
    } finally {
      setLoadingPlaylists(false);
    }
  };

  const handleToggleCompletion = async () => {
    if (!point || !roadmapId) return;

    try {
      const newStatus = !point.isCompleted;
      await updateRoadmapProgress(roadmapId, pointId, newStatus);

      setPoint((prev) => (prev ? { ...prev, isCompleted: newStatus } : null));

      // Animate the change
      headerScale.value = withSpring(
        1.05,
        { damping: 15, stiffness: 200 },
        () => {
          headerScale.value = withSpring(1, { damping: 15, stiffness: 200 });
        }
      );
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

  const containerStyle = useAnimatedStyle(() => ({
    opacity: fadeIn.value,
    transform: [{ translateY: slideY.value }],
  }));

  const headerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: headerScale.value }],
  }));

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center">
          <Icon name="Loader" size={32} color="#6366f1" />
          <Text className="mt-4 text-lg text-muted-foreground">Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!point) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center">
          <Text className="text-lg text-foreground">Point not found</Text>
          <Button onPress={() => router.back()} className="mt-4">
            <Text className="text-white">Go Back</Text>
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <Animated.View style={containerStyle} className="flex-1">
        {/* Header */}
        <View className="px-6 py-4 border-b border-border">
          <View className="flex-row items-center justify-between mb-4">
            <TouchableOpacity
              onPress={() => router.back()}
              className="p-2 -ml-2"
            >
              <Icon name="ArrowLeft" size={24} color="#6b7280" />
            </TouchableOpacity>
            <Text className="text-lg font-semibold text-foreground">
              Learning Point
            </Text>
            <View className="w-8" />
          </View>

          <Animated.View style={headerStyle}>
            <Card className="p-4 bg-card border border-border">
              <View className="flex-row items-start justify-between mb-3">
                <View className="flex-1">
                  <View className="flex-row items-center mb-2">
                    <Text
                      className={`text-xs font-medium px-2 py-1 rounded-full ${getLevelBgColor(point.level)}`}
                      style={{ color: getLevelColor(point.level) }}
                    >
                      {point.level.toUpperCase()}
                    </Text>
                    <Text className="text-xs text-muted-foreground ml-2">
                      Step {point.order}
                    </Text>
                  </View>
                  <Text className="text-xl font-bold text-foreground mb-2">
                    {point.title}
                  </Text>
                  <Text className="text-sm text-muted-foreground">
                    {point.description}
                  </Text>
                </View>
              </View>

              <Button
                onPress={handleToggleCompletion}
                className={`w-full ${
                  point.isCompleted
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                <View className="flex-row items-center justify-center">
                  <Icon
                    name={point.isCompleted ? "Check" : "Plus"}
                    size={20}
                    color="#ffffff"
                  />
                  <Text className="text-white font-semibold ml-2">
                    {point.isCompleted
                      ? "Mark as Incomplete"
                      : "Mark as Complete"}
                  </Text>
                </View>
              </Button>
            </Card>
          </Animated.View>
        </View>

        {/* Content */}
        <ScrollView className="flex-1 px-6 py-4">
          <Text className="text-lg font-semibold text-foreground mb-4">
            Learning Videos
          </Text>

          {loadingPlaylists ? (
            <View className="items-center py-8">
              <Icon name="Loader" size={24} color="#6366f1" />
              <Text className="mt-2 text-muted-foreground">
                Loading videos...
              </Text>
            </View>
          ) : (
            <View className="space-y-3">
              {playlists.map((playlist, index) => (
                <PlaylistCard
                  key={playlist.id}
                  playlist={playlist}
                  index={index}
                />
              ))}
            </View>
          )}

          <View className="h-6" />
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

interface PlaylistCardProps {
  playlist: PlaylistItem;
  index: number;
}

function PlaylistCard({ playlist, index }: PlaylistCardProps) {
  const scale = useSharedValue(0.9);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(
      index * 100,
      withSpring(1, { damping: 15, stiffness: 200 })
    );
    opacity.value = withDelay(index * 100, withTiming(1, { duration: 400 }));
  }, [index]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePress = () => {
    // TODO: Open video or handle playlist item click
    Alert.alert("Video", `Opening: ${playlist.title}`);
  };

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity onPress={handlePress}>
        <Card className="p-4 bg-card border border-border">
          <View className="flex-row items-start">
            <View className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg items-center justify-center mr-3">
              <Icon name="Play" size={20} color="#6366f1" />
            </View>

            <View className="flex-1">
              <Text className="text-base font-semibold text-foreground mb-1">
                {playlist.title}
              </Text>
              <Text
                className="text-sm text-muted-foreground mb-2"
                numberOfLines={2}
              >
                {playlist.description}
              </Text>
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <Icon name="Clock" size={12} color="#6b7280" />
                  <Text className="text-xs text-muted-foreground ml-1">
                    {playlist.duration}
                  </Text>
                </View>
                <Icon name="ExternalLink" size={12} color="#6366f1" />
              </View>
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    </Animated.View>
  );
}
