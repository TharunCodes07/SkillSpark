import React from 'react';
import { View, Pressable } from 'react-native';
import { Text } from '@/components/ui/text';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingAnimation } from '@/components/ui/loading-animation';
import { ToneSwitcher } from './ToneSwitcher';
import { getSubtopicContent } from './topicUtils';
import type { ContentVersion } from './types';
import type { TopicExplanation } from '@/lib/gemini';
import { ChevronDown, ChevronUp, Code, Lightbulb, Sparkles, BookOpen } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

interface WebSearchContentSectionProps {
  webSearchContent: TopicExplanation | null;
  isGeneratingWebContent: boolean;
  contentView: 'old' | 'new';
  webSearchExpandedSections: Set<string>;
  webSearchSubtopicVersions: Record<string, ContentVersion>;
  showWebSearchToneSwitcher: Set<string>;
  isDarkColorScheme: boolean;
  onContentViewChange: (view: 'old' | 'new') => void;
  onToggleSection: (id: string) => void;
  onVersionChange: (id: string, version: ContentVersion) => void;
  onToggleToneSwitcher: (id: string) => void;
}

export function WebSearchContentSection({
  webSearchContent,
  isGeneratingWebContent,
  contentView,
  webSearchExpandedSections,
  webSearchSubtopicVersions,
  showWebSearchToneSwitcher,
  isDarkColorScheme,
  onContentViewChange,
  onToggleSection,
  onVersionChange,
  onToggleToneSwitcher,
}: WebSearchContentSectionProps) {
  if (!webSearchContent && !isGeneratingWebContent) {
    return null;
  }

  return (
    <>
      {webSearchContent && (
        <View className="-mt-4">
          <CardContent className="pt-0">
            <View className="mb-4">
              <Text className="text-xs text-muted-foreground mb-2 text-center">
                Switch between original and latest content
              </Text>
              <View className="flex-row gap-2">
                <Pressable
                  onPress={() => onContentViewChange('old')}
                  className={`flex-1 py-3 rounded-lg border-2 ${
                    contentView === 'old' 
                      ? 'bg-primary border-primary' 
                      : 'bg-background dark:bg-card border-border'
                  }`}
                >
                  <View className="flex-row items-center justify-center gap-2">
                    <BookOpen 
                      size={16} 
                      color={contentView === 'old' ? '#ffffff' : (isDarkColorScheme ? '#a1a1aa' : '#52525b')} 
                    />
                    <Text 
                      className={`text-sm font-semibold ${
                        contentView === 'old' ? 'text-white' : 'text-foreground'
                      }`}
                    >
                      Original
                    </Text>
                  </View>
                </Pressable>
                <Pressable
                  onPress={() => onContentViewChange('new')}
                  className={`flex-1 py-3 rounded-lg border-2 ${
                    contentView === 'new' 
                      ? 'bg-primary border-primary' 
                      : 'bg-background dark:bg-card border-border'
                  }`}
                >
                  <View className="flex-row items-center justify-center gap-2">
                    <Sparkles 
                      size={16} 
                      color={contentView === 'new' ? '#ffffff' : (isDarkColorScheme ? '#a1a1aa' : '#52525b')} 
                    />
                    <Text 
                      className={`text-sm font-semibold ${
                        contentView === 'new' ? 'text-white' : 'text-foreground'
                      }`}
                    >
                      Latest
                    </Text>
                  </View>
                </Pressable>
              </View>
            </View>
          </CardContent>
        </View>
      )}

      {(isGeneratingWebContent || webSearchContent) && (
        <Card className="border-2 border-primary/20 bg-primary/5 dark:bg-primary/10">
          <CardHeader>
            <View className="flex-row items-center gap-2 mb-2">
              <Sparkles size={18} className="text-primary" />
              <CardTitle>Content Preview</CardTitle>
            </View>
            <Text className="text-sm text-muted-foreground">
              {isGeneratingWebContent 
                ? 'Generating fresh content from web search results...'
                : 'Use the toggle above to switch between original and latest content'
              }
            </Text>
          </CardHeader>
          <CardContent>
            {isGeneratingWebContent && (
              <View className="items-center py-8">
                <LoadingAnimation 
                  title="Generating Latest Content"
                  messages={[
                    'Creating educational material from web search results...',
                    'Analyzing recent updates...',
                    'Organizing information...',
                    'Almost ready...',
                  ]}
                />
              </View>
            )}
          </CardContent>
        </Card>
      )}

      {contentView === 'new' && webSearchContent && (
        <Card className="border-2 border-primary/20 bg-primary/5 dark:bg-primary/10">
          <CardHeader>
            <View className="flex-row items-center gap-2 mb-2">
              <Sparkles size={18} className="text-primary" />
              <CardTitle>Latest Updates & Insights</CardTitle>
              <Badge className="bg-primary">
                <Text className="text-xs text-white font-semibold">NEW</Text>
              </Badge>
            </View>
            <Text className="text-sm text-muted-foreground">
              Fresh content generated from recent web search findings
            </Text>
          </CardHeader>
          <CardContent>
            <View className="space-y-3">
              {webSearchContent.subtopics.map((subtopic, index) => {
                const isExpanded = webSearchExpandedSections.has(subtopic.id);
                const currentVersion = webSearchSubtopicVersions[subtopic.id] || 'default';
                const content = getSubtopicContent(subtopic, currentVersion);
                
                return (
                  <View 
                    key={subtopic.id}
                    className="border border-border rounded-lg overflow-hidden bg-card"
                  >
                    <Button
                      variant="ghost"
                      onPress={() => onToggleSection(subtopic.id)}
                      className="w-full flex-row items-center justify-between p-4 rounded-none"
                    >
                      <View className="flex-1 flex-row items-center gap-2">
                        <View className="bg-primary/10 dark:bg-primary/20 rounded-full w-7 h-7 items-center justify-center">
                          <Text className="text-primary font-bold text-xs">
                            {index + 1}
                          </Text>
                        </View>
                        <Text className="font-semibold text-base text-left flex-1 flex-wrap pr-2">
                          {subtopic.title}
                        </Text>
                        <Badge className="bg-primary/10 dark:bg-primary/20">
                          <Text className="text-xs text-primary font-medium">New</Text>
                        </Badge>
                      </View>
                      {isExpanded ? (
                        <ChevronUp size={20} color={isDarkColorScheme ? '#a1a1aa' : '#71717a'} />
                      ) : (
                        <ChevronDown size={20} color={isDarkColorScheme ? '#a1a1aa' : '#71717a'} />
                      )}
                    </Button>

                    {isExpanded && (
                      <View className="border-t border-border bg-secondary/20 dark:bg-secondary/10">
                        <ToneSwitcher
                          currentVersion={currentVersion}
                          onVersionChange={(v) => onVersionChange(subtopic.id, v)}
                          showSettings={showWebSearchToneSwitcher.has(subtopic.id)}
                          onToggleSettings={() => onToggleToneSwitcher(subtopic.id)}
                          subtopicId={subtopic.id}
                        />

                        <Animated.View 
                          key={`${subtopic.id}-${currentVersion}`}
                          entering={FadeIn.duration(300)}
                          className="px-4 pb-4"
                        >
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
                              {subtopic.keyPoints.map((point: string, idx: number) => (
                                <View key={idx} className="flex-row items-start gap-2 mb-1">
                                  <Text className="text-muted-foreground">•</Text>
                                  <Text className="flex-1 text-sm text-muted-foreground leading-relaxed">
                                    {point}
                                  </Text>
                                </View>
                              ))}
                            </View>
                          )}
                        </Animated.View>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </CardContent>
        </Card>
      )}
    </>
  );
}
