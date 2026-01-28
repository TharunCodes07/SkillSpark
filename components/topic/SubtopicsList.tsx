import React from 'react';
import { View, Pressable } from 'react-native';
import { Text } from '@/components/ui/text';
import { SubtopicCard } from './SubtopicCard';
import type { ContentVersion } from './types';
import type { SubtopicPerformance } from '@/hooks/queries/useTopicQueries';
import { BookOpen, MessageSquare } from 'lucide-react-native';
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

interface SubtopicsListProps {
  subtopics: Subtopic[];
  expandedSections: Set<string>;
  selectedSubtopics: Set<string>;
  subtopicVersions: Record<string, ContentVersion>;
  showToneSwitcher: Set<string>;
  subtopicPerformance: Map<string, SubtopicPerformance>;
  isAskDoubtMode: boolean;
  currentEmotion: string | null;
  isDarkColorScheme: boolean;
  failedTones?: { default?: boolean; simplified?: boolean; story?: boolean };
  onToggleSection: (id: string) => void;
  onToggleSelection: (id: string) => void;
  onVersionChange: (id: string, version: ContentVersion) => void;
  onToggleToneSwitcher: (id: string) => void;
  onRegenerateContent: (version: ContentVersion) => void;
  onClearSelection: () => void;
  onOpenAskModal: () => void;
  setErrorMessage: (msg: string) => void;
}

export function SubtopicsList({
  subtopics,
  expandedSections,
  selectedSubtopics,
  subtopicVersions,
  showToneSwitcher,
  subtopicPerformance,
  isAskDoubtMode,
  currentEmotion,
  isDarkColorScheme,
  failedTones,
  onToggleSection,
  onToggleSelection,
  onVersionChange,
  onToggleToneSwitcher,
  onRegenerateContent,
  onClearSelection,
  onOpenAskModal,
  setErrorMessage,
}: SubtopicsListProps) {
  const getSubtopicVersion = (subtopicId: string): ContentVersion => {
    return subtopicVersions[subtopicId] || 'default';
  };

  const isContentFailed = (version: ContentVersion): boolean => {
    if (!failedTones) return false;
    return failedTones[version] || false;
  };

  return (
    <>
      {isAskDoubtMode && (
        <Animated.View 
          entering={FadeIn.duration(300)}
          className="mb-4 p-4 rounded-xl border flex-row items-center justify-between"
          style={{
            backgroundColor: isDarkColorScheme ? '#1e1b4b' : '#eef2ff',
            borderColor: isDarkColorScheme ? '#4338ca' : '#a5b4fc',
          }}
        >
          <View className="flex-1">
            <Text style={{ color: isDarkColorScheme ? '#e0e7ff' : '#312e81', fontWeight: '600', fontSize: 14 }}>
              {selectedSubtopics.size > 0 
                ? `${selectedSubtopics.size} topic${selectedSubtopics.size > 1 ? 's' : ''} selected`
                : 'Select topics to ask about'}
            </Text>
            <Text style={{ color: isDarkColorScheme ? '#a5b4fc' : '#6366f1', fontSize: 12 }}>
              Tap topics to select them
            </Text>
          </View>
          <View className="flex-row gap-2">
            {selectedSubtopics.size > 0 && (
              <Pressable
                onPress={onClearSelection}
                className="px-3 py-2 rounded-lg active:opacity-70"
                style={{
                  borderWidth: 1,
                  borderColor: isDarkColorScheme ? '#6366f1' : '#a5b4fc',
                }}
              >
                <Text style={{ color: isDarkColorScheme ? '#a5b4fc' : '#4f46e5', fontSize: 12, fontWeight: '500' }}>Clear</Text>
              </Pressable>
            )}
            <Pressable
              onPress={() => {
                if (selectedSubtopics.size > 0) {
                  onOpenAskModal();
                } else {
                  setErrorMessage('Please select at least one topic to ask about.');
                }
              }}
              className="px-3 py-2 rounded-lg flex-row items-center gap-1 active:opacity-70"
              style={{ 
                backgroundColor: selectedSubtopics.size > 0 
                  ? (isDarkColorScheme ? '#6366f1' : '#4f46e5')
                  : (isDarkColorScheme ? '#3f3f46' : '#d4d4d8'),
              }}
            >
              <MessageSquare size={14} color={selectedSubtopics.size > 0 ? '#ffffff' : '#71717a'} />
              <Text style={{ 
                color: selectedSubtopics.size > 0 ? '#ffffff' : '#71717a', 
                fontSize: 12, 
                fontWeight: '500' 
              }}>Ask</Text>
            </Pressable>
          </View>
        </Animated.View>
      )}

      <View className="mb-4">
        <View className="flex-row items-center gap-2 mb-3">
          <BookOpen size={20} color={isDarkColorScheme ? '#a78bfa' : '#7c3aed'} />
          <Text className="text-lg font-semibold text-foreground">Key Concepts</Text>
        </View>
      </View>
      
      <View className="space-y-3">
        {subtopics.map((subtopic, index) => {
          const isExpanded = expandedSections.has(subtopic.id);
          const performance = subtopicPerformance?.get(subtopic.id);
          const currentVersion = getSubtopicVersion(subtopic.id);
          const showingToneSwitcher = showToneSwitcher.has(subtopic.id);
          const isSelected = selectedSubtopics.has(subtopic.id);
          
          return (
            <SubtopicCard
              key={`${subtopic.id}-${index}`}
              subtopic={subtopic}
              index={index}
              isExpanded={isExpanded}
              isSelected={isSelected}
              isAskDoubtMode={isAskDoubtMode}
              performance={performance}
              currentVersion={currentVersion}
              showingToneSwitcher={showingToneSwitcher}
              currentEmotion={currentEmotion}
              isDarkColorScheme={isDarkColorScheme}
              isContentFailed={isContentFailed}
              onToggle={() => {
                if (isAskDoubtMode) {
                  onToggleSelection(subtopic.id);
                } else {
                  onToggleSection(subtopic.id);
                }
              }}
              onVersionChange={(v) => onVersionChange(subtopic.id, v)}
              onToggleToneSwitcher={() => onToggleToneSwitcher(subtopic.id)}
              onRegenerateContent={onRegenerateContent}
            />
          );
        })}
      </View>
    </>
  );
}
