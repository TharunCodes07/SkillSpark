import React from 'react';
import { View, Pressable } from 'react-native';
import { Text } from '@/components/ui/text';
import { ToneSwitcher } from './ToneSwitcher';
import { getSubtopicContent } from './topicUtils';
import type { ContentVersion } from './types';
import type { SubtopicPerformance } from '@/hooks/queries/useTopicQueries';
import { ChevronDown, Code, Lightbulb, AlertCircle, RefreshCw, Sparkles, CheckCircle2, Circle } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

interface Subtopic {
  id: string;
  title: string;
  explanationDefault?: string;
  explanationSimplified?: string;
  explanationStory?: string;
  example?: string;
  exampleSimplified?: string;
  exampleStory?: string;
  exampleExplanation?: string;
  keyPoints?: string[];
}

interface SubtopicCardProps {
  subtopic: Subtopic;
  index: number;
  isExpanded: boolean;
  isSelected: boolean;
  isAskDoubtMode: boolean;
  performance?: SubtopicPerformance;
  currentVersion: ContentVersion;
  showingToneSwitcher: boolean;
  currentEmotion: string | null;
  isDarkColorScheme: boolean;
  isContentFailed: (version: ContentVersion) => boolean;
  onToggle: () => void;
  onVersionChange: (version: ContentVersion) => void;
  onToggleToneSwitcher: () => void;
  onRegenerateContent: (version: ContentVersion) => void;
}

export function SubtopicCard({
  subtopic,
  index,
  isExpanded,
  isSelected,
  isAskDoubtMode,
  performance,
  currentVersion,
  showingToneSwitcher,
  currentEmotion,
  isDarkColorScheme,
  isContentFailed,
  onToggle,
  onVersionChange,
  onToggleToneSwitcher,
  onRegenerateContent,
}: SubtopicCardProps) {
  const content = getSubtopicContent(subtopic, currentVersion);

  return (
    <Pressable 
      onPress={onToggle}
      className="rounded-xl overflow-hidden"
      style={{
        borderWidth: isSelected ? 2 : 1,
        borderColor: isSelected 
          ? (isDarkColorScheme ? '#6366f1' : '#4f46e5')
          : (isDarkColorScheme ? '#27272a' : '#e4e4e7'),
        backgroundColor: isDarkColorScheme ? 'rgba(39, 39, 42, 0.5)' : '#ffffff',
      }}
    >
      <View className="flex-row items-center p-4">
        {isAskDoubtMode && (
          <View className="mr-3">
            {isSelected ? (
              <CheckCircle2 size={22} color={isDarkColorScheme ? '#6366f1' : '#4f46e5'} />
            ) : (
              <Circle size={22} color={isDarkColorScheme ? '#52525b' : '#a1a1aa'} />
            )}
          </View>
        )}
        <View className="flex-1 flex-row items-center gap-3">
          <View className={`w-8 h-8 rounded-full items-center justify-center ${
            performance 
              ? (performance.status === 'strong' ? 'bg-green-500' :
                 performance.status === 'weak' ? 'bg-red-500' :
                 'bg-amber-500')
              : 'bg-primary/20 dark:bg-primary/30'
          }`}>
            <Text className={`text-xs font-bold ${
              performance ? 'text-white' : 'text-primary'
            }`}>
              {index + 1}
            </Text>
          </View>
          <Text className="font-medium text-base text-foreground flex-1 flex-wrap pr-2">
            {subtopic.title}
          </Text>
        </View>
        {!isAskDoubtMode && (
          <ChevronDown 
            size={20} 
            color={isDarkColorScheme ? '#a1a1aa' : '#71717a'}
            style={{ transform: [{ rotate: isExpanded ? '180deg' : '0deg' }] }}
          />
        )}
      </View>

      {isExpanded && (
        <View className="border-t border-border bg-secondary/20 dark:bg-secondary/10">
          <ToneSwitcher
            currentVersion={currentVersion}
            onVersionChange={onVersionChange}
            showSettings={showingToneSwitcher}
            onToggleSettings={onToggleToneSwitcher}
            subtopicId={subtopic.id}
          />
          
          {currentEmotion && (currentEmotion === 'wbored' || currentEmotion === 'drowsy' || currentEmotion === 'frustrated' || currentEmotion === 'confused') && (
            <View className="mx-4 mb-2 bg-primary/10 dark:bg-primary/20 border border-primary/20 dark:border-primary/30 rounded-lg p-2 flex-row items-center">
              <Sparkles size={14} color={isDarkColorScheme ? '#a78bfa' : '#7c3aed'} />
              <Text className="text-xs text-foreground flex-1 ml-2">
                {currentEmotion === 'wbored' || currentEmotion === 'drowsy' 
                  ? 'Content adapting to keep you engaged' 
                  : 'Content simplifying to help you understand'}
              </Text>
            </View>
          )}

          <Animated.View 
            key={`${subtopic.id}-${currentVersion}`}
            entering={FadeIn.duration(300)}
            className="px-4 pb-4"
          >
            {isContentFailed(currentVersion) ? (
              <View className="bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
                <View className="flex-row items-start gap-3">
                  <AlertCircle size={20} color={isDarkColorScheme ? '#f87171' : '#dc2626'} />
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-red-900 dark:text-red-100 mb-1">
                      Failed to generate {currentVersion} content
                    </Text>
                    <Text className="text-xs text-red-700 dark:text-red-300 mb-3">
                      Try regenerating or switch to another style.
                    </Text>
                    <Pressable
                      onPress={() => onRegenerateContent(currentVersion)}
                      className="flex-row items-center gap-2 self-start px-3 py-2 rounded-lg border border-red-300 dark:border-red-700 active:opacity-70"
                    >
                      <RefreshCw size={14} color={isDarkColorScheme ? '#f87171' : '#dc2626'} />
                      <Text className="text-red-700 dark:text-red-300 text-xs font-medium">
                        Retry
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            ) : (
              <>
                <Text className="text-muted-foreground leading-6 mb-4">
                  {content.explanation}
                </Text>

                {content.example && (
                  <View className="mt-3">
                    <View className="flex-row items-center gap-2 mb-2">
                      <Code size={16} color={isDarkColorScheme ? '#4ade80' : '#16a34a'} />
                      <Text className="text-sm font-semibold text-green-600 dark:text-green-400">
                        Example
                      </Text>
                    </View>
                    <View className="bg-slate-900 dark:bg-slate-950 rounded-lg p-4">
                      <Text className="text-slate-100 font-mono text-sm leading-6">
                        {content.example}
                      </Text>
                    </View>
                    
                    {subtopic.exampleExplanation && (
                      <View className="flex-row items-start gap-2 mt-2">
                        <Lightbulb size={14} color={isDarkColorScheme ? '#fbbf24' : '#d97706'} />
                        <Text className="flex-1 text-sm text-muted-foreground italic">
                          {subtopic.exampleExplanation}
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                {subtopic.keyPoints && subtopic.keyPoints.length > 0 && (
                  <View className="mt-3">
                    <Text className="text-sm font-semibold mb-2 text-foreground">Key Points</Text>
                    {subtopic.keyPoints.map((point, idx) => (
                      <View key={idx} className="flex-row items-start gap-2 mb-1">
                        <Text className="text-muted-foreground">•</Text>
                        <Text className="flex-1 text-sm text-muted-foreground leading-relaxed">
                          {point}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </>
            )}
          </Animated.View>
        </View>
      )}
    </Pressable>
  );
}
