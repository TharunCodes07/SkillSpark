import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { getDifficultyColor } from './topicUtils';

interface TopicHeaderProps {
  topicName: string;
  difficulty?: string;
  overview: string;
}

export function TopicHeader({ topicName, difficulty, overview }: TopicHeaderProps) {
  return (
    <View className="mb-6">
      <View className="flex-row items-start justify-between mb-3">
        <Text className="text-2xl font-bold text-foreground flex-1 pr-3" style={{ flexWrap: 'wrap' }}>
          {topicName}
        </Text>
        {difficulty && (
          <View className={`px-3 py-1 rounded-full ${getDifficultyColor(difficulty).bg}`}>
            <Text className={`text-xs font-semibold uppercase ${getDifficultyColor(difficulty).text}`}>
              {difficulty}
            </Text>
          </View>
        )}
      </View>
      <Text className="text-muted-foreground leading-6">
        {overview}
      </Text>
    </View>
  );
}
