import React from "react";
import { View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from "react-native-reanimated";
import { useEffect } from "react";

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export default function HeroSection() {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(30);
  const scale = useSharedValue(0.95);

  useEffect(() => {
    opacity.value = withTiming(1, {
      duration: 800,
      easing: Easing.out(Easing.quad),
    });
    translateY.value = withTiming(0, {
      duration: 800,
      easing: Easing.out(Easing.quad),
    });
    scale.value = withTiming(1, {
      duration: 800,
      easing: Easing.out(Easing.quad),
    });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  const pulseScale = useSharedValue(1);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 2000, easing: Easing.inOut(Easing.quad) }),
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      false
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  return (
    <Animated.View style={animatedStyle} className="px-6 pt-8 pb-6">
      <AnimatedLinearGradient
        colors={[
          "rgba(99, 102, 241, 0.1)",
          "rgba(168, 85, 247, 0.1)",
          "transparent",
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={pulseStyle}
        className="absolute inset-0 rounded-3xl"
      />

      <View className="relative z-10 m-4">
        <Text className="text-5xl font-bold text-foreground mt-5 mb-3">
          Welcome to{"\n"}
          <Text className="text-indigo-500 font-bold">SkillTrail</Text>
        </Text>

        <Text className="text-lg text-muted-foreground leading-relaxed mb-6">
          Your personalized learning companion. Generate custom roadmaps, track
          your progress, and master any skill with curated content.
        </Text>
      </View>
    </Animated.View>
  );
}
