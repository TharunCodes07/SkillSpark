import React from 'react';
import { View, Pressable } from 'react-native';
import { Text } from '@/components/ui/text';
import { ChevronDown, AlertCircle } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

interface CommonPitfallsSectionProps {
  commonPitfalls: string[];
  isExpanded: boolean;
  isDarkColorScheme: boolean;
  onToggle: () => void;
}

export function CommonPitfallsSection({
  commonPitfalls,
  isExpanded,
  isDarkColorScheme,
  onToggle,
}: CommonPitfallsSectionProps) {
  if (!commonPitfalls || commonPitfalls.length === 0) {
    return null;
  }

  return (
    <View className="mt-6">
      <Pressable 
        onPress={onToggle}
        className="flex-row items-center justify-between py-3 active:opacity-70"
      >
        <View className="flex-row items-center gap-2">
          <AlertCircle size={20} color={isDarkColorScheme ? '#f87171' : '#dc2626'} />
          <Text className="text-lg font-semibold text-foreground">Common Pitfalls</Text>
          <View className="bg-red-500/20 dark:bg-red-500/30 px-2 py-0.5 rounded-full">
            <Text className="text-xs font-medium text-red-600 dark:text-red-400">{commonPitfalls.length}</Text>
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
          {commonPitfalls.map((pitfall, index) => (
            <View key={index} className="flex-row items-start gap-3">
              <View className="bg-red-500 rounded-full w-6 h-6 items-center justify-center mt-0.5">
                <Text className="text-white font-bold text-xs">!</Text>
              </View>
              <Text className="flex-1 text-muted-foreground leading-6">
                {pitfall}
              </Text>
            </View>
          ))}
        </Animated.View>
      )}
    </View>
  );
}
