import React, { useState, useCallback } from "react";
import { View, ScrollView, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";

import HeroSection from "~/components/home/HeroSection";
import RoadmapGenerator from "~/components/home/RoadmapGenerator";
import ActiveRoadmapDisplay from "~/components/home/ActiveRoadmapDisplay";
import LearningStats from "~/components/home/LearningStats";

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setRefreshTrigger((prev) => prev + 1);

    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const handleRoadmapGenerated = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleProgressUpdate = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

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
        <HeroSection />

        <RoadmapGenerator onRoadmapGenerated={handleRoadmapGenerated} />

        <LearningStats key={refreshTrigger} />

        <ActiveRoadmapDisplay
          refreshTrigger={refreshTrigger}
          onProgressUpdate={handleProgressUpdate}
        />

        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
  );
}
