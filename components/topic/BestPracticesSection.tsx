import React from 'react';
import { View, Pressable } from 'react-native';
import { Text } from '@/components/ui/text';
import { ChevronDown, CheckCircle2 } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

interface BestPracticesSectionProps {
  bestPractices: string[];
  isExpanded: boolean;
  isDarkColorScheme: boolean;
  onToggle: () => void;
}

export function BestPracticesSection({
  bestPractices,
  isExpanded,
  isDarkColorScheme,
  onToggle,
}: BestPracticesSectionProps) {
  if (!bestPractices || bestPractices.length === 0) {
    return null;
  }

  return (
    <View className="mt-6">
      <Pressable 
        onPress={onToggle}
        className="flex-row items-center justify-between py-3 active:opacity-70"
      >
        <View className="flex-row items-center gap-2">
          <CheckCircle2 size={20} color={isDarkColorScheme ? '#4ade80' : '#16a34a'} />
          <Text className="text-lg font-semibold text-foreground">Best Practices</Text>
          <View className="bg-green-500/20 dark:bg-green-500/30 px-2 py-0.5 rounded-full">
            <Text className="text-xs font-medium text-green-600 dark:text-green-400">{bestPractices.length}</Text>
          </View>
        </View>
        <ChevronDown 
          size={20} 
          color={isDarkColorScheme ? '#a1a1aa' : '#71717a'}
          style={{ transform: [{ rotate: isExpanded ? '180deg' : '0deg' }] }}
        />
      </Pressable>
      {isExpanded && (
        <Animated.View entering={FadeIn.duration(200)} className="space-y-3 mt-2">
          {bestPractices.map((practice, index) => (
            <View key={index} className="flex-row items-start gap-3">
              <View className="bg-green-500 rounded-full w-6 h-6 items-center justify-center mt-0.5">
                <Text className="text-white font-bold text-xs">{index + 1}</Text>
              </View>
              <Text className="flex-1 text-muted-foreground leading-6">
                {practice}
              </Text>
            </View>
          ))}
        </Animated.View>
      )}
    </View>
  );
}
