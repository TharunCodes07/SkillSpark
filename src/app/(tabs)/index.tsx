import React, { useState, useCallback } from "react";
import { View, ScrollView, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";

// Import home components
import HeroSection from "~/components/home/HeroSection";
import RoadmapGenerator from "~/components/home/RoadmapGenerator";
import ActiveRoadmapDisplay from "~/components/home/ActiveRoadmapDisplay";
import LearningStats from "~/components/home/LearningStats";

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Trigger refresh for all components
    setRefreshTrigger((prev) => prev + 1);

    // Simulate loading time for smooth UX
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const handleRoadmapGenerated = () => {
    // Refresh the active roadmap display when a new roadmap is generated
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleProgressUpdate = () => {
    // Refresh stats when progress is updated
    setRefreshTrigger((prev) => prev + 1);
  };

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      setRefreshTrigger((prev) => prev + 1);
    }, [])
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#6366f1"
            colors={["#6366f1"]}
          />
        }
      >
        {/* Hero Section */}
        <HeroSection />

        {/* Roadmap Generator */}
        <RoadmapGenerator onRoadmapGenerated={handleRoadmapGenerated} />

        {/* Learning Stats */}
        <LearningStats key={refreshTrigger} />

        {/* Active Roadmap Display */}
        <ActiveRoadmapDisplay
          refreshTrigger={refreshTrigger}
          onProgressUpdate={handleProgressUpdate}
        />

        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
  );
}
