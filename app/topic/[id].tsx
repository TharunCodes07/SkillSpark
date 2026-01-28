import React, { useState, useEffect, useMemo, useRef } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { Audio } from 'expo-av';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ErrorDisplay } from '@/components/ui/error-display';
import { LoadingAnimation } from '@/components/ui/loading-animation';
import { APIKeyRequiredDialog } from '@/components/ui/api-key-required-dialog';
import { BottomSheet } from '@/components/primitives/bottomSheet/bottom-sheet.native';
import { useCurrentUserId } from '@/hooks/stores/useUserStore';
import { useIsEmotionDetectionEnabled } from '@/hooks/stores/useEmotionStore';
import { useIsGeneratedVideosEnabled } from '@/hooks/stores/useGeneratedVideosStore';
import { useTopicDetail, usePersistTopicContent, useRegenerateSingleTone, useGenerateWebSearchContent, useRegenerateSelectedSubtopics } from '@/hooks/queries/useTopicQueries';
import { checkNeedsRegeneration, setNeedsRegeneration } from '@/server/queries/topics';
import { useQuizWorkflow } from '@/hooks/queries/useQuizWorkflow';
import type { TopicExplanation } from '@/lib/gemini';
import { searchTopicUpdates } from '@/lib/webSearchService';
import { useWebSearchProvider } from '@/hooks/stores/useWebSearchProviderStore';
import { getItem, setItem } from '@/lib/storage';
import { useColorScheme } from '@/lib/useColorScheme';
import { TopicEmotionDetector } from '@/components/emotion/TopicEmotionDetector';
import { ToneChangeModal } from '@/components/emotion/ToneChangeModal';
import { ArrowLeft } from 'lucide-react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';

import {
  TopicHeader,
  TopicActionButtons,
  BottomActionButtons,
  BestPracticesSection,
  CommonPitfallsSection,
  SubtopicsList,
  WebSearchContentSection,
  FailedTonesWarning,
  MessageBanners,
  TopicDetailSkeleton,
  TopicSearchResultsModal,
  TopicVideoGenerator,
  AskDoubtModal,
  DistractionAlertModal,
  ExitQuizModal,
  RegeneratingOverlay,
  QuizModal,
  QuizResultsModal,
  PerformanceChangeModal,
  TopicAnalysisModal,
  isCUID,
  type ContentVersion,
} from '@/components/topic';

export default function TopicDetailScreen() {
  const { id, webSearchResults: webSearchParam, topicName: topicNameParam, generateWebContent } = useLocalSearchParams<{ 
    id: string; 
    webSearchResults?: string;
    topicName?: string;
    generateWebContent?: string;
  }>();
  const router = useRouter();
  const currentUserId = useCurrentUserId();
  const isEmotionDetectionEnabled = useIsEmotionDetectionEnabled();
  const isGeneratedVideosEnabled = useIsGeneratedVideosEnabled();
  const provider = useWebSearchProvider();
  const { isDarkColorScheme } = useColorScheme();
  
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [subtopicVersions, setSubtopicVersions] = useState<Record<string, ContentVersion>>({});
  const [hasPersistedContent, setHasPersistedContent] = useState(false);
  const [webSearchResults, setWebSearchResults] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [webSearchContent, setWebSearchContent] = useState<TopicExplanation | null>(null);
  const [isGeneratingWebContent, setIsGeneratingWebContent] = useState(false);
  const [webSearchExpandedSections, setWebSearchExpandedSections] = useState<Set<string>>(new Set());
  const [webSearchSubtopicVersions, setWebSearchSubtopicVersions] = useState<Record<string, ContentVersion>>({});
  const [contentView, setContentView] = useState<'old' | 'new'>('old');
  const [selectedSubtopics, setSelectedSubtopics] = useState<Set<string>>(new Set());
  const [isAskDoubtMode, setIsAskDoubtMode] = useState(false);
  const [showToneSwitcher, setShowToneSwitcher] = useState<Set<string>>(new Set());
  const [showWebSearchToneSwitcher, setShowWebSearchToneSwitcher] = useState<Set<string>>(new Set());
  const [showRegenerateModal, setShowRegenerateModal] = useState(false);
  const [regenerateInstructions, setRegenerateInstructions] = useState('');
  const [isRegeneratingSubtopics, setIsRegeneratingSubtopics] = useState(false);
  
  const [showQuiz, setShowQuiz] = useState(false);
  const [showQuizResults, setShowQuizResults] = useState(false);
  const [showExitQuizModal, setShowExitQuizModal] = useState(false);
  const [showPerformanceChangeModal, setShowPerformanceChangeModal] = useState(false);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [isCheckingRegeneration, setIsCheckingRegeneration] = useState(true);
  
  const [isBestPracticesExpanded, setIsBestPracticesExpanded] = useState(false);
  const [isCommonPitfallsExpanded, setIsCommonPitfallsExpanded] = useState(false);
  
  const [showDistractionAlert, setShowDistractionAlert] = useState(false);
  const [distractionCount, setDistractionCount] = useState(0);
  const soundRef = useRef<Audio.Sound | null>(null);
  const lastDistractionTime = useRef<number>(0);
  const [currentEmotion, setCurrentEmotion] = useState<string | null>(null);
  const lastToneSwitchTime = useRef<number>(0);
  
  const [showToneChangeModal, setShowToneChangeModal] = useState(false);
  const [newToneToShow, setNewToneToShow] = useState<'simplified' | 'story'>('simplified');
  
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const [apiKeyDialogMessage, setApiKeyDialogMessage] = useState('');
  
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const searchSheetRef = useRef<BottomSheetModal>(null);
  const expandedSectionsRef = useRef<Set<string>>(new Set());

  const { 
    data: currentTopicDetail, 
    isLoading,
    isFetching,
    error,
    refetch 
  } = useTopicDetail(id, currentUserId || undefined, !isCheckingRegeneration);

  const persistContentMutation = usePersistTopicContent();
  const regenerateToneMutation = useRegenerateSingleTone();
  const generateWebSearchContentMutation = useGenerateWebSearchContent();
  const regenerateSelectedSubtopicsMutation = useRegenerateSelectedSubtopics();
  
  const { isGenerating: isGeneratingQuiz, quizId, error: quizError, initiateQuiz, reset: resetQuizWorkflow } = useQuizWorkflow();

  const isRegenerating = isFetching && !isLoading;

  // Check if regeneration is needed on page load (after returning from quiz)
  useEffect(() => {
    const checkRegeneration = async () => {
      if (!id || !currentUserId) return;
      
      try {
        const needsRegen = await checkNeedsRegeneration(currentUserId, id);
        
        if (needsRegen) {
          console.log('🔔 Regeneration needed - showing confirmation modal');
          // Show modal to ask user if they want to regenerate
          setShowPerformanceChangeModal(true);
          // Keep query disabled - wait for user confirmation
          setIsCheckingRegeneration(false);
        } else {
          // No regeneration needed, allow query to run normally
          console.log('✅ No regeneration needed - loading content');
          setIsCheckingRegeneration(false);
        }
      } catch (error) {
        console.error('Failed to check regeneration status:', error);
        // On error, allow query to run normally
        setIsCheckingRegeneration(false);
      }
    };
    
    checkRegeneration();
  }, [id, currentUserId]);

  const explanation = useMemo(() => {
    if (!currentTopicDetail) return null;
    return currentTopicDetail.explanation;
  }, [currentTopicDetail]);

  useEffect(() => {
    if (id) {
      const storageKey = `webSearchContent_${id}`;
      const savedWebSearchContent = getItem<TopicExplanation>(storageKey);
      
      if (savedWebSearchContent) {
        const contentWithUniqueIds = {
          ...savedWebSearchContent,
          subtopics: savedWebSearchContent.subtopics.map((st, index) => ({
            ...st,
            id: `websearch-${index + 1}`
          }))
        };
        setWebSearchContent(contentWithUniqueIds);
      }
    }
  }, [id]);

  useEffect(() => {
    if (generateWebContent === 'true' && webSearchParam && topicNameParam && !isGeneratingWebContent && !webSearchContent) {
      let parsedResults;
      try {
        parsedResults = JSON.parse(webSearchParam);
      } catch (e) {
        return;
      }
      if (parsedResults && parsedResults.length > 0) {
        setIsGeneratingWebContent(true);
        
        generateWebSearchContentMutation.mutate({
          topicName: topicNameParam,
          webSearchResults: parsedResults,
          context: 'Latest Updates'
        }, {
          onSuccess: async (explanation) => {
            const contentWithUniqueIds = {
              ...explanation,
              subtopics: explanation.subtopics.map((st, index) => ({
                ...st,
                id: `websearch-${index + 1}`
              }))
            };
            
            setWebSearchContent(contentWithUniqueIds);
            setIsGeneratingWebContent(false);
            
            if (id) {
              const storageKey = `webSearchContent_${id}`;
              setItem(storageKey, contentWithUniqueIds);
            }
          },
          onError: () => {
            setIsGeneratingWebContent(false);
            setErrorMessage('Failed to generate content from web search results. Please try again.');
          }
        });
      }
    }
  }, [generateWebContent, webSearchParam, topicNameParam, isGeneratingWebContent, webSearchContent, generateWebSearchContentMutation, id]);

  const isPersistingRef = useRef(false);
  
  useEffect(() => {
    if (isPersistingRef.current) return;
    if (!currentTopicDetail || !currentUserId) return;

    const { topic, explanation, subtopicPerformance } = currentTopicDetail;
    
    const isFromDatabase = explanation.subtopics.some(st => st.id && isCUID(st.id));
    
    const needsPersistence = explanation.subtopics.length > 0 && 
                             !hasPersistedContent && 
                             !isFromDatabase;
    
    const isRegeneration = subtopicPerformance.size > 0;
    
    if (needsPersistence) {
      isPersistingRef.current = true;
      
      persistContentMutation.mutate({
        topicId: topic.id,
        userId: currentUserId,
        category: topic.category,
        explanation,
        isRegeneration,
      }, {
        onSuccess: () => {
          setHasPersistedContent(true);
          isPersistingRef.current = false;
        },
        onError: () => {
          isPersistingRef.current = false;
        }
      });
    }
  }, [currentTopicDetail, currentUserId, hasPersistedContent]);

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
    expandedSectionsRef.current = newExpanded;
  };

  const setSubtopicVersion = (subtopicId: string, version: ContentVersion) => {
    setSubtopicVersions(prev => ({
      ...prev,
      [subtopicId]: version
    }));
  };

  const handleTakeTest = async () => {
    if (!currentTopicDetail || !currentUserId) return;
    const { topic } = currentTopicDetail;
    setShowQuiz(true);
    await initiateQuiz(topic.id, topic.name, currentUserId);
  };
  
  useEffect(() => {
    if (quizError) {
      setShowQuiz(false);
      setErrorMessage(quizError);
    }
  }, [quizError]);
  
  const handleAnalyze = () => {
    setShowAnalysisModal(true);
  };
  
  const handleQuizComplete = () => {
    setShowQuiz(false);
    setShowQuizResults(false);
    resetQuizWorkflow();
    // Show modal to ask if user wants to regenerate content
    setShowPerformanceChangeModal(true);
  };

  const handleRegenerateFromQuiz = async () => {
    setShowPerformanceChangeModal(false);
    console.log('✅ User confirmed regeneration - refetching content');
    // Refetch to get the regenerated content based on quiz performance
    await refetch();
  };

  const handleSkipRegenerate = async () => {
    setShowPerformanceChangeModal(false);
    // Clear the regeneration flag so it doesn't show again
    if (id && currentUserId) {
      try {
        await setNeedsRegeneration(currentUserId, id, false);
        console.log('✅ User skipped regeneration - cleared flag');
        // Now refetch to load existing content without regeneration
        await refetch();
      } catch (error) {
        console.error('Failed to clear regeneration flag:', error);
        // Still try to load content even if flag clear failed
        await refetch();
      }
    }
  };

  const handleWebSearch = async () => {
    if (!currentTopicDetail) return;
    
    const langSearchKey = await SecureStore.getItemAsync('api_key_langsearch');
    const googleSerperKey = await SecureStore.getItemAsync('api_key_googleserper');
    
    if ((!langSearchKey || !langSearchKey.trim()) && (!googleSerperKey || !googleSerperKey.trim())) {
      setApiKeyDialogMessage('Web search requires either LangSearch or Google Serper API key. Please configure one in Settings.');
      setShowApiKeyDialog(true);
      return;
    }
    
    setIsSearching(true);
    searchSheetRef.current?.present();
    
    try {
      const result = await searchTopicUpdates(currentTopicDetail.topic.name, provider);
      setWebSearchResults(result.newSubtopics);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to search for updates. Please try again.');
      searchSheetRef.current?.dismiss();
    } finally {
      setIsSearching(false);
    }
  };

  const playDistractionSound = async () => {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });

      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBCyAx/DZiTYIGGS57+qFNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBCyAx/DZiTYIGGS57+qFNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBCyAx/DZiTYIGGS57+qFNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBCyAx/DZiTYIGGS57+qFNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBCyAx/DZiTYIGGS57+qFNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBCyAx/DZiTYIGGS57+qFNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBCyAx/DZiTYIGGS57+qFNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBCyAx/DZiTYIGGS57+qFNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAo=' },
        { shouldPlay: true, volume: 0.8 }
      );

      soundRef.current = sound;

      setTimeout(async () => {
        try {
          await sound.unloadAsync();
        } catch (e) {}
      }, 1000);
    } catch (error) {}
  };

  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const isRegeneratingTone = (tone: ContentVersion): boolean => {
    return regenerateToneMutation.isPending && 
           regenerateToneMutation.variables?.tone === tone;
  };

  const handleRegenerateContent = async (tone: ContentVersion) => {
    if (!currentUserId || !currentTopicDetail || !explanation) return;
    
    const canonicalTitles = explanation.subtopics.map(st => st.title);
    const context = currentTopicDetail.topic.category;
    
    regenerateToneMutation.mutate({
      topicId: currentTopicDetail.topic.id,
      userId: currentUserId,
      topicName: currentTopicDetail.topic.name,
      context,
      tone,
      canonicalTitles,
    });
  };

  const handleRegenerateSelectedSubtopics = async () => {
    if (!currentUserId || !currentTopicDetail || selectedSubtopics.size === 0 || !explanation) return;
    
    if (!regenerateInstructions.trim()) {
      setErrorMessage('Please enter your question or instructions for regeneration.');
      return;
    }

    const selectedSubtopicTitles = explanation.subtopics
      .filter(st => selectedSubtopics.has(st.id))
      .map(st => st.title);

    setIsRegeneratingSubtopics(true);
    setShowRegenerateModal(false);

    regenerateSelectedSubtopicsMutation.mutate({
      topicId: currentTopicDetail.topic.id,
      userId: currentUserId,
      topicName: currentTopicDetail.topic.name,
      context: currentTopicDetail.topic.category,
      selectedSubtopicTitles,
      userInstructions: regenerateInstructions,
    }, {
      onSuccess: () => {
        setIsRegeneratingSubtopics(false);
        setSelectedSubtopics(new Set());
        setRegenerateInstructions('');
        setSuccessMessage('Selected subtopics have been regenerated with your instructions for all 3 learning styles.');
      },
      onError: (error) => {
        setIsRegeneratingSubtopics(false);
        setErrorMessage(error instanceof Error ? error.message : 'Failed to regenerate subtopics. Please try again.');
      },
    });
  };

  const handleEmotionDetected = (emotion: string, confidence: number) => {
    setCurrentEmotion(emotion);
    
    if ((emotion === 'looking_away' && confidence > 0.5) || (emotion === 'distracted') || (emotion === 'drowsy' && confidence > 0.7)) {
      const now = Date.now();
      if (now - lastDistractionTime.current > 10000) {
        lastDistractionTime.current = now;
        setDistractionCount(prev => prev + 1);
        setShowDistractionAlert(true);
        playDistractionSound();
      }
    }
    
    if (confidence > 0.5) {
      const now = Date.now();
      if (now - lastToneSwitchTime.current > 45000) {
        let targetTone: ContentVersion | null = null;
        let shouldSwitch = false;
        
        if (emotion === 'bored' || emotion === 'drowsy') {
          targetTone = 'story';
          shouldSwitch = true;
        } else if (emotion === 'frustrated' || emotion === 'confused') {
          targetTone = 'simplified';
          shouldSwitch = true;
        }
        
        if (shouldSwitch && targetTone) {
          lastToneSwitchTime.current = now;
          
          const currentExpandedSections = expandedSectionsRef.current;
          
          if (currentExpandedSections.size > 0) {
            const updatedVersions: Record<string, ContentVersion> = {};
            currentExpandedSections.forEach(subtopicId => {
              const currentTone = subtopicVersions[subtopicId] || 'default';
              if (currentTone !== targetTone) {
                updatedVersions[subtopicId] = targetTone;
              }
            });
            
            if (Object.keys(updatedVersions).length > 0) {
              setSubtopicVersions(prev => ({ ...prev, ...updatedVersions }));
              setNewToneToShow(targetTone);
              setShowToneChangeModal(true);
            }
          }
        }
      }
    }
  };

  const BackButton = () => (
    <View className="flex-row items-center px-4 py-3 border-b border-border bg-background">
      <Pressable 
        onPress={() => router.back()}
        className="h-9 w-9 items-center justify-center rounded-lg active:bg-secondary"
      >
        <ArrowLeft size={20} color={isDarkColorScheme ? '#fafafa' : '#0a0a0a'} />
      </Pressable>
    </View>
  );

  // Show loading while checking if regeneration is needed
  if (isCheckingRegeneration) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['top']}>
        <Stack.Screen options={{ headerShown: false, animation: 'fade', animationDuration: 150 }} />
        <BackButton />
        <ScrollView className="flex-1">
          <TopicDetailSkeleton />
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['top']}>
        <Stack.Screen options={{ headerShown: false, animation: 'fade', animationDuration: 150 }} />
        <BackButton />
        <ScrollView className="flex-1">
          <TopicDetailSkeleton />
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['top']}>
        <Stack.Screen options={{ headerShown: false, animation: 'fade', animationDuration: 150 }} />
        <BackButton />
        <ErrorDisplay
          error={error instanceof Error ? error.message : String(error)}
          onRetry={() => refetch()}
          title="Failed to load topic details"
        />
      </SafeAreaView>
    );
  }

  if (!currentTopicDetail) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['top']}>
        <Stack.Screen options={{ headerShown: false, animation: 'fade', animationDuration: 150 }} />
        <BackButton />
        <View className="flex-1 justify-center items-center p-6">
          <Text className="text-center text-muted-foreground">Topic details not available</Text>
          <Button onPress={() => router.back()} className="mt-4">
            <Text className="text-white">Go Back</Text>
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  const topic = currentTopicDetail.topic;
  const subtopicPerformance = currentTopicDetail.subtopicPerformance;
  
  if (!explanation) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['top']}>
        <Stack.Screen options={{ headerShown: false, animation: 'fade', animationDuration: 150 }} />
        <BackButton />
        <View className="flex-1 justify-center items-center p-6">
          <Text className="text-center text-muted-foreground">Failed to load content</Text>
          <Button onPress={() => router.back()} className="mt-4">
            <Text className="text-white">Go Back</Text>
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <Stack.Screen options={{ headerShown: false, animation: 'fade', animationDuration: 150 }} />
      
      <BackButton />
      
      {isRegenerating && (
        <Animated.View 
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          className="absolute inset-0 z-50 bg-background/90 justify-center items-center"
          style={{ zIndex: 50 }}
        >
          <Card className="mx-8 p-6">
            <LoadingAnimation 
              title="Personalizing Content"
              messages={[
                'Regenerating learning material based on your quiz performance...',
                'Strengthening weak areas...',
                'Adapting to your level...',
                'Almost ready...',
              ]}
            />
          </Card>
        </Animated.View>
      )}
      
      <ScrollView className="flex-1">
        <View className="p-6 space-y-6">
          <MessageBanners
            errorMessage={errorMessage}
            successMessage={successMessage}
            onDismissError={() => setErrorMessage(null)}
            onDismissSuccess={() => setSuccessMessage(null)}
          />

          <FailedTonesWarning
            failedTones={explanation.failedTones || {}}
            isRegeneratingTone={isRegeneratingTone}
            onRegenerateContent={handleRegenerateContent}
          />

          {isEmotionDetectionEnabled && (
            <TopicEmotionDetector onEmotionDetected={handleEmotionDetected} />
          )}

          <TopicHeader
            topicName={topic.name}
            difficulty={explanation.difficulty}
            overview={explanation.overview}
          />

          {isGeneratedVideosEnabled && currentUserId && (
            <TopicVideoGenerator
              topicId={id!}
              topicName={topic.name}
              userId={currentUserId}
              subtopics={explanation.subtopics}
            />
          )}

          <TopicActionButtons
            isSearching={isSearching}
            isAskDoubtMode={isAskDoubtMode}
            isDarkColorScheme={isDarkColorScheme}
            onSearch={handleWebSearch}
            onToggleAskDoubtMode={() => {
              if (isAskDoubtMode) {
                setIsAskDoubtMode(false);
                setSelectedSubtopics(new Set());
              } else {
                setIsAskDoubtMode(true);
              }
            }}
          />

          <WebSearchContentSection
            webSearchContent={webSearchContent}
            isGeneratingWebContent={isGeneratingWebContent}
            contentView={contentView}
            webSearchExpandedSections={webSearchExpandedSections}
            webSearchSubtopicVersions={webSearchSubtopicVersions}
            showWebSearchToneSwitcher={showWebSearchToneSwitcher}
            isDarkColorScheme={isDarkColorScheme}
            onContentViewChange={setContentView}
            onToggleSection={(id) => {
              const newExpanded = new Set(webSearchExpandedSections);
              if (newExpanded.has(id)) {
                newExpanded.delete(id);
              } else {
                newExpanded.add(id);
              }
              setWebSearchExpandedSections(newExpanded);
            }}
            onVersionChange={(id, version) => {
              setWebSearchSubtopicVersions(prev => ({ ...prev, [id]: version }));
            }}
            onToggleToneSwitcher={(id) => {
              const newShow = new Set(showWebSearchToneSwitcher);
              if (newShow.has(id)) {
                newShow.delete(id);
              } else {
                newShow.add(id);
              }
              setShowWebSearchToneSwitcher(newShow);
            }}
          />

          {(contentView === 'old' || !webSearchContent) && (
            <SubtopicsList
              subtopics={explanation.subtopics}
              expandedSections={expandedSections}
              selectedSubtopics={selectedSubtopics}
              subtopicVersions={subtopicVersions}
              showToneSwitcher={showToneSwitcher}
              subtopicPerformance={subtopicPerformance}
              isAskDoubtMode={isAskDoubtMode}
              currentEmotion={currentEmotion}
              isDarkColorScheme={isDarkColorScheme}
              failedTones={explanation.failedTones}
              onToggleSection={toggleSection}
              onToggleSelection={(id) => {
                const newSelected = new Set(selectedSubtopics);
                if (newSelected.has(id)) {
                  newSelected.delete(id);
                } else {
                  newSelected.add(id);
                }
                setSelectedSubtopics(newSelected);
              }}
              onVersionChange={setSubtopicVersion}
              onToggleToneSwitcher={(id) => {
                const newShow = new Set(showToneSwitcher);
                if (newShow.has(id)) {
                  newShow.delete(id);
                } else {
                  newShow.add(id);
                }
                setShowToneSwitcher(newShow);
              }}
              onRegenerateContent={handleRegenerateContent}
              onClearSelection={() => setSelectedSubtopics(new Set())}
              onOpenAskModal={() => setShowRegenerateModal(true)}
              setErrorMessage={setErrorMessage}
            />
          )}

          <BestPracticesSection
            bestPractices={explanation.bestPractices || []}
            isExpanded={isBestPracticesExpanded}
            isDarkColorScheme={isDarkColorScheme}
            onToggle={() => setIsBestPracticesExpanded(!isBestPracticesExpanded)}
          />

          <CommonPitfallsSection
            commonPitfalls={explanation.commonPitfalls || []}
            isExpanded={isCommonPitfallsExpanded}
            isDarkColorScheme={isDarkColorScheme}
            onToggle={() => setIsCommonPitfallsExpanded(!isCommonPitfallsExpanded)}
          />
          
          <BottomActionButtons
            isDarkColorScheme={isDarkColorScheme}
            isGeneratingQuiz={isGeneratingQuiz}
            onTakeTest={handleTakeTest}
            onAnalyze={handleAnalyze}
          />
        </View>
      </ScrollView>

      <RegeneratingOverlay visible={isRegeneratingSubtopics} isDarkColorScheme={isDarkColorScheme} />

      <AskDoubtModal
        visible={showRegenerateModal}
        isDarkColorScheme={isDarkColorScheme}
        selectedSubtopics={selectedSubtopics}
        subtopics={explanation.subtopics}
        regenerateInstructions={regenerateInstructions}
        onInstructionsChange={setRegenerateInstructions}
        onSubmit={handleRegenerateSelectedSubtopics}
        onClose={() => {
          setShowRegenerateModal(false);
          setRegenerateInstructions('');
        }}
      />

      <DistractionAlertModal
        visible={showDistractionAlert}
        onClose={() => setShowDistractionAlert(false)}
      />

      <BottomSheet>
        <TopicSearchResultsModal
          sheetRef={searchSheetRef}
          results={webSearchResults}
          isSearching={isSearching}
          topicName={topic.name}
          onRefresh={handleWebSearch}
        />
      </BottomSheet>

      <ToneChangeModal
        isOpen={showToneChangeModal}
        onClose={() => setShowToneChangeModal(false)}
        newTone={newToneToShow}
      />

      <APIKeyRequiredDialog
        open={showApiKeyDialog}
        onOpenChange={setShowApiKeyDialog}
        title="API Key Required"
        description={apiKeyDialogMessage}
        onGoToSettings={() => router.push('/(tabs)/settings')}
      />
      
      <QuizModal
        visible={showQuiz}
        isGeneratingQuiz={isGeneratingQuiz}
        quizId={quizId}
        topicName={topic.name}
        isDarkColorScheme={isDarkColorScheme}
        onClose={() => setShowQuiz(false)}
        onExitPress={() => {
          if (isGeneratingQuiz) {
            setShowQuiz(false);
            resetQuizWorkflow();
          } else {
            setShowExitQuizModal(true);
          }
        }}
        onQuizComplete={() => {
          setShowQuiz(false);
          setShowQuizResults(true);
        }}
      />
      
      <QuizResultsModal
        visible={showQuizResults}
        quizId={quizId}
        userId={currentUserId || ''}
        topicName={topic.name}
        isDarkColorScheme={isDarkColorScheme}
        onClose={() => {
          setShowQuizResults(false);
          handleQuizComplete();
        }}
      />
      
      <ExitQuizModal
        visible={showExitQuizModal}
        onExit={() => {
          setShowExitQuizModal(false);
          setShowQuiz(false);
        }}
        onContinue={() => setShowExitQuizModal(false)}
      />

      <PerformanceChangeModal
        visible={showPerformanceChangeModal}
        isDarkColorScheme={isDarkColorScheme}
        onYes={handleRegenerateFromQuiz}
        onNo={handleSkipRegenerate}
      />

      <TopicAnalysisModal
        visible={showAnalysisModal}
        isDarkColorScheme={isDarkColorScheme}
        topicName={topic.name}
        subtopicPerformance={subtopicPerformance}
        onClose={() => setShowAnalysisModal(false)}
      />
    </SafeAreaView>
  );
}
