import React from 'react';
import { View, Pressable, Modal, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { QuizComponent } from '@/components/roadmap/QuizComponent';
import { QuizResults } from '@/components/roadmap/QuizResults';
import { MessageSquare, AlertCircle, Wand2, ArrowLeft } from 'lucide-react-native';
import Animated, { FadeIn, FadeOut, ZoomIn } from 'react-native-reanimated';

interface Subtopic {
  id: string;
  title: string;
}

interface AskDoubtModalProps {
  visible: boolean;
  isDarkColorScheme: boolean;
  selectedSubtopics: Set<string>;
  subtopics: Subtopic[];
  regenerateInstructions: string;
  onInstructionsChange: (text: string) => void;
  onSubmit: () => void;
  onClose: () => void;
}

export function AskDoubtModal({
  visible,
  isDarkColorScheme,
  selectedSubtopics,
  subtopics,
  regenerateInstructions,
  onInstructionsChange,
  onSubmit,
  onClose,
}: AskDoubtModalProps) {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Animated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(200)}
        className="flex-1 items-center justify-center px-6"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      >
        <Pressable 
          className="absolute inset-0" 
          onPress={onClose}
        />
        
        <Animated.View
          entering={ZoomIn.duration(300).springify()}
          className="bg-card rounded-2xl w-full max-w-md overflow-hidden"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.3,
            shadowRadius: 20,
            elevation: 10,
          }}
        >
          <View className="p-6">
            <View className="flex-row items-center gap-2 mb-2">
              <MessageSquare size={24} color={isDarkColorScheme ? '#a78bfa' : '#7c3aed'} />
              <Text className="text-xl font-bold text-foreground">
                Ask a Doubt
              </Text>
            </View>
            <Text className="text-sm text-muted-foreground mb-4 leading-relaxed">
              Type your question about the selected topics. We'll regenerate the content with better explanations focused on your doubt.
            </Text>

            <View className="mb-2">
              <Text className="text-sm font-medium text-foreground mb-1">
                Selected Topics ({selectedSubtopics.size})
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {subtopics
                  .filter(st => selectedSubtopics.has(st.id))
                  .map(st => (
                    <View 
                      key={st.id} 
                      style={{
                        backgroundColor: isDarkColorScheme ? 'rgba(99, 102, 241, 0.2)' : 'rgba(79, 70, 229, 0.1)',
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 4,
                      }}
                    >
                      <Text style={{
                        fontSize: 12,
                        color: isDarkColorScheme ? '#a5b4fc' : '#4f46e5',
                      }}>
                        {st.title}
                      </Text>
                    </View>
                  ))}
              </View>
            </View>

            <View className="mb-6">
              <Text className="text-sm font-medium text-foreground mb-2">
                Your Question
              </Text>
              <View className="min-h-[120px] p-3 rounded-lg border border-border bg-background">
                <TextInput
                  value={regenerateInstructions}
                  onChangeText={onInstructionsChange}
                  placeholder="e.g., How are variables created? Show more practical examples..."
                  placeholderTextColor="#9ca3af"
                  multiline
                  className="text-sm text-foreground"
                  style={{ minHeight: 100, textAlignVertical: 'top' }}
                />
              </View>
              <Text className="text-xs text-muted-foreground mt-2">
                💡 Be specific about what you want to understand better
              </Text>
            </View>

            <View className="flex-col gap-2">
              <Pressable
                onPress={onSubmit}
                disabled={!regenerateInstructions.trim()}
                style={{
                  backgroundColor: !regenerateInstructions.trim() 
                    ? (isDarkColorScheme ? 'rgba(99, 102, 241, 0.3)' : 'rgba(79, 70, 229, 0.3)')
                    : (isDarkColorScheme ? '#6366f1' : '#4f46e5'),
                  width: '100%',
                  height: 48,
                  borderRadius: 8,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <MessageSquare size={20} color="#ffffff" />
                <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600' }}>
                  Get Answer
                </Text>
              </Pressable>

              <Pressable
                onPress={onClose}
                className="w-full h-12 items-center justify-center rounded-lg active:opacity-70"
              >
                <Text className="text-base font-medium text-muted-foreground">
                  Cancel
                </Text>
              </Pressable>
            </View>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

interface DistractionAlertModalProps {
  visible: boolean;
  onClose: () => void;
}

export function DistractionAlertModal({ visible, onClose }: DistractionAlertModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Animated.View
        entering={FadeIn.duration(200)}
        className="flex-1 bg-black/50 justify-center items-center px-6"
      >
        <Pressable 
          className="absolute inset-0" 
          onPress={onClose}
        />
        
        <Animated.View
          entering={ZoomIn.duration(300).springify()}
          className="bg-card rounded-xl w-full max-w-md overflow-hidden border border-border"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 5,
          }}
        >
          <View className="p-6">
            <View className="mb-6">
              <Text className="text-xl font-semibold text-foreground mb-2">
                Focus Reminder
              </Text>
              <Text className="text-sm text-muted-foreground leading-relaxed">
                We noticed you may be distracted. Take a moment to refocus on your learning.
              </Text>
            </View>

            <Pressable
              onPress={onClose}
              className="w-full h-11 items-center justify-center rounded-lg bg-primary active:opacity-90"
            >
              <Text className="text-sm font-medium text-primary-foreground">
                Continue Learning
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

interface ExitQuizModalProps {
  visible: boolean;
  onExit: () => void;
  onContinue: () => void;
}

export function ExitQuizModal({ visible, onExit, onContinue }: ExitQuizModalProps) {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onContinue}
      statusBarTranslucent
    >
      <Animated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(200)}
        className="flex-1 items-center justify-center px-6"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      >
        <Pressable 
          className="absolute inset-0" 
          onPress={onContinue}
        />
        
        <Animated.View
          entering={ZoomIn.duration(300).springify()}
          className="bg-card rounded-2xl w-full max-w-md overflow-hidden"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.3,
            shadowRadius: 20,
            elevation: 10,
          }}
        >
          <View className="p-6">
            <View className="items-center mb-4">
              <View className="bg-red-100 dark:bg-red-900/30 rounded-full p-4 mb-3">
                <AlertCircle size={48} className="text-red-500" />
              </View>
              <Text className="text-xl font-bold text-foreground text-center mb-2">
                Exit Quiz?
              </Text>
              <Text className="text-sm text-muted-foreground text-center leading-relaxed">
                Are you sure you want to exit? Your progress will not be saved.
              </Text>
            </View>

            <View className="flex-col gap-3">
              <Pressable
                onPress={onExit}
                className="w-full h-12 items-center justify-center rounded-lg bg-red-500 active:bg-red-600"
              >
                <Text className="text-base font-semibold text-white">
                  Yes, Exit Quiz
                </Text>
              </Pressable>

              <Pressable
                onPress={onContinue}
                className="w-full h-12 items-center justify-center rounded-lg border border-border active:bg-secondary"
              >
                <Text className="text-base font-medium text-foreground">
                  Continue Quiz
                </Text>
              </Pressable>
            </View>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

interface RegeneratingOverlayProps {
  visible: boolean;
  isDarkColorScheme: boolean;
}

export function RegeneratingOverlay({ visible, isDarkColorScheme }: RegeneratingOverlayProps) {
  if (!visible) return null;

  return (
    <Animated.View 
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(200)}
      className="absolute inset-0 z-50 bg-background/90 justify-center items-center"
      style={{ zIndex: 50 }}
    >
      <Card className="mx-8 p-6">
        <View className="items-center">
          <View className="bg-primary/10 dark:bg-primary/20 rounded-full p-4 mb-4">
            <Wand2 size={32} color={isDarkColorScheme ? '#a78bfa' : '#7c3aed'} />
          </View>
          <ActivityIndicator size="large" className="mb-4" />
          <Text className="text-lg font-semibold text-foreground text-center mb-2">
            Regenerating Subtopics
          </Text>
          <Text className="text-sm text-muted-foreground text-center leading-relaxed">
            Creating better examples focused on your instructions...
          </Text>
        </View>
      </Card>
    </Animated.View>
  );
}

interface QuizModalProps {
  visible: boolean;
  isGeneratingQuiz: boolean;
  quizId: string | null;
  topicName: string;
  isDarkColorScheme: boolean;
  onClose: () => void;
  onExitPress: () => void;
  onQuizComplete: () => void;
}

export function QuizModal({
  visible,
  isGeneratingQuiz,
  quizId,
  topicName,
  isDarkColorScheme,
  onClose,
  onExitPress,
  onQuizComplete,
}: QuizModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 bg-background" edges={['top']}>
        <View className="flex-row items-center px-4 py-3 border-b border-border">
          <Pressable
            onPress={onExitPress}
            className="h-9 w-9 items-center justify-center rounded-lg active:bg-secondary"
          >
            <ArrowLeft size={20} color={isDarkColorScheme ? '#fafafa' : '#0a0a0a'} />
          </Pressable>
          <Text className="flex-1 text-center text-lg font-semibold pr-9">
            {isGeneratingQuiz ? 'Preparing Quiz...' : `${topicName} - Quiz`}
          </Text>
        </View>
        {isGeneratingQuiz ? (
          <View className="flex-1 p-6">
            <View className="mb-6">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-5/6" />
            </View>
            {[1, 2, 3].map((i) => (
              <View key={i} className="mb-6 p-4 rounded-xl bg-card border border-border">
                <Skeleton className="h-5 w-32 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-4/5 mb-4" />
                <View className="space-y-3">
                  {[1, 2, 3, 4].map((j) => (
                    <View key={j} className="flex-row items-center gap-3">
                      <Skeleton className="h-5 w-5 rounded-full" />
                      <Skeleton className="h-4 flex-1" />
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        ) : quizId ? (
          <QuizComponent
            quizId={quizId}
            onQuizComplete={onQuizComplete}
            onBack={onClose}
          />
        ) : null}
      </SafeAreaView>
    </Modal>
  );
}

interface QuizResultsModalProps {
  visible: boolean;
  quizId: string | null;
  userId: string;
  topicName: string;
  isDarkColorScheme: boolean;
  onClose: () => void;
}

export function QuizResultsModal({
  visible,
  quizId,
  userId,
  topicName,
  isDarkColorScheme,
  onClose,
}: QuizResultsModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 bg-background" edges={['top']}>
        <View className="flex-row items-center px-4 py-3 border-b border-border">
          <Pressable
            onPress={onClose}
            className="h-9 w-9 items-center justify-center rounded-lg active:bg-secondary"
          >
            <ArrowLeft size={20} color={isDarkColorScheme ? '#fafafa' : '#0a0a0a'} />
          </Pressable>
          <Text className="flex-1 text-center text-lg font-semibold pr-9">
            Quiz Results
          </Text>
        </View>
        {quizId && userId && (
          <QuizResults
            userId={userId}
            quizId={quizId}
            stepTitle={topicName}
            onClose={onClose}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
}
