import React, { useMemo } from 'react';
import { Modal, View, Pressable, ScrollView } from 'react-native';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import { X, Trophy, Target, TrendingUp, AlertCircle, Award } from 'lucide-react-native';
import Animated, { FadeIn, FadeOut, SlideInRight } from 'react-native-reanimated';
// @ts-ignore - No type declarations available
import { PieChart } from 'react-native-gifted-charts';

interface SubtopicPerformance {
  subtopicId: string;
  correctCount: number;
  incorrectCount: number;
  totalAttempts: number;
  status: string;
  accuracy: number;
}

interface TopicAnalysisModalProps {
  visible: boolean;
  isDarkColorScheme: boolean;
  topicName: string;
  subtopicPerformance: Map<string, SubtopicPerformance>;
  onClose: () => void;
}

export function TopicAnalysisModal({
  visible,
  isDarkColorScheme,
  topicName,
  subtopicPerformance,
  onClose,
}: TopicAnalysisModalProps) {
  
  // Calculate overall statistics
  const stats = useMemo(() => {
    let totalCorrect = 0;
    let totalIncorrect = 0;
    let totalQuestions = 0;
    let strongCount = 0;
    let weakCount = 0;
    let perfectSubtopics = 0;

    subtopicPerformance.forEach((perf) => {
      totalCorrect += perf.correctCount;
      totalIncorrect += perf.incorrectCount;
      totalQuestions += perf.totalAttempts;

      if (perf.accuracy === 100) {
        perfectSubtopics++;
      }
      
      if (perf.status === 'strong') {
        strongCount++;
      } else if (perf.status === 'weak') {
        weakCount++;
      }
    });

    const overallScore = totalQuestions > 0 
      ? Math.round((totalCorrect / totalQuestions) * 100) 
      : 0;

    const performanceLevel = 
      overallScore >= 90 ? 'Excellent' :
      overallScore >= 75 ? 'Good' :
      overallScore >= 60 ? 'Average' :
      'Needs Improvement';

    return {
      totalCorrect,
      totalIncorrect,
      totalQuestions,
      overallScore,
      performanceLevel,
      strongCount,
      weakCount,
      perfectSubtopics,
      attemptedSubtopics: subtopicPerformance.size,
    };
  }, [subtopicPerformance]);

  // Prepare pie chart data
  const pieData = useMemo(() => {
    if (stats.totalQuestions === 0) return [];
    
    return [
      {
        value: stats.totalCorrect,
        color: isDarkColorScheme ? '#22c55e' : '#16a34a',
        text: `${stats.totalCorrect}`,
        label: 'Correct',
      },
      {
        value: stats.totalIncorrect,
        color: isDarkColorScheme ? '#ef4444' : '#dc2626',
        text: `${stats.totalIncorrect}`,
        label: 'Incorrect',
      },
    ];
  }, [stats, isDarkColorScheme]);

  const getScoreColor = () => {
    if (stats.overallScore >= 90) return isDarkColorScheme ? '#22c55e' : '#16a34a';
    if (stats.overallScore >= 75) return isDarkColorScheme ? '#3b82f6' : '#2563eb';
    if (stats.overallScore >= 60) return isDarkColorScheme ? '#f59e0b' : '#d97706';
    return isDarkColorScheme ? '#ef4444' : '#dc2626';
  };

  if (subtopicPerformance.size === 0) {
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
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
        >
          <Pressable className="absolute inset-0" onPress={onClose} />
          
          <Animated.View
            entering={SlideInRight.duration(300).springify()}
            className="w-full max-w-md rounded-2xl p-6"
            style={{
              backgroundColor: isDarkColorScheme ? '#18181b' : '#ffffff',
            }}
          >
            <View className="items-center py-8">
              <AlertCircle size={48} color={isDarkColorScheme ? '#a1a1aa' : '#71717a'} />
              <Text className="text-xl font-bold text-foreground mt-4 mb-2">
                No Data Yet
              </Text>
              <Text className="text-sm text-muted-foreground text-center">
                Take a test to see your performance analysis
              </Text>
              <Pressable
                onPress={onClose}
                className="mt-6 px-6 py-3 rounded-lg"
                style={{ backgroundColor: isDarkColorScheme ? '#6366f1' : '#4f46e5' }}
              >
                <Text className="text-sm font-semibold text-white">
                  Got it
                </Text>
              </Pressable>
            </View>
          </Animated.View>
        </Animated.View>
      </Modal>
    );
  }

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
        className="flex-1"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
      >
        <Pressable className="absolute inset-0" onPress={onClose} />
        
        <Animated.View
          entering={SlideInRight.duration(300).springify()}
          className="flex-1 mt-16"
          style={{
            backgroundColor: isDarkColorScheme ? '#09090b' : '#ffffff',
          }}
        >
          {/* Header */}
          <View 
            className="flex-row items-center justify-between px-6 py-4 border-b"
            style={{ borderBottomColor: isDarkColorScheme ? '#27272a' : '#e4e4e7' }}
          >
            <View className="flex-1 mr-4">
              <Text className="text-xl font-bold text-foreground">
                Performance Analysis
              </Text>
              <Text className="text-sm text-muted-foreground mt-1" numberOfLines={1}>
                {topicName}
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              className="h-10 w-10 items-center justify-center rounded-lg active:bg-secondary"
            >
              <X size={20} color={isDarkColorScheme ? '#fafafa' : '#0a0a0a'} />
            </Pressable>
          </View>

          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            <View className="px-6 py-6">
              
              {/* Overall Score Card */}
              <Card className="mb-4 overflow-hidden">
                <View className="p-6 items-center">
                  <View 
                    className="h-32 w-32 items-center justify-center rounded-full mb-4"
                    style={{ backgroundColor: `${getScoreColor()}15` }}
                  >
                    <Text 
                      className="text-5xl font-bold"
                      style={{ color: getScoreColor() }}
                    >
                      {stats.overallScore}
                    </Text>
                    <Text className="text-sm font-medium text-muted-foreground">
                      Overall Score
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-2 mb-2">
                    <Trophy size={20} color={getScoreColor()} />
                    <Text className="text-lg font-semibold text-foreground">
                      {stats.performanceLevel}
                    </Text>
                  </View>
                  <Text className="text-sm text-muted-foreground text-center">
                    Based on {stats.totalQuestions} question{stats.totalQuestions !== 1 ? 's' : ''} across {stats.attemptedSubtopics} subtopic{stats.attemptedSubtopics !== 1 ? 's' : ''}
                  </Text>
                </View>
              </Card>

              {/* Performance Distribution - Pie Chart */}
              <Card className="mb-4">
                <View className="p-6">
                  <View className="flex-row items-center gap-2 mb-4">
                    <Target size={20} className="text-primary" />
                    <Text className="text-lg font-semibold text-foreground">
                      Answer Distribution
                    </Text>
                  </View>
                  
                  <View className="items-center py-4">
                    <PieChart
                      data={pieData}
                      donut
                      radius={80}
                      innerRadius={50}
                      centerLabelComponent={() => (
                        <View className="items-center">
                          <Text className="text-2xl font-bold text-foreground">
                            {stats.totalQuestions}
                          </Text>
                          <Text className="text-xs text-muted-foreground">
                            Total
                          </Text>
                        </View>
                      )}
                    />
                  </View>

                  <View className="flex-row justify-around mt-4">
                    <View className="items-center">
                      <View className="flex-row items-center gap-2 mb-1">
                        <View 
                          className="h-3 w-3 rounded-full" 
                          style={{ backgroundColor: isDarkColorScheme ? '#22c55e' : '#16a34a' }}
                        />
                        <Text className="text-sm font-medium text-foreground">
                          Correct
                        </Text>
                      </View>
                      <Text className="text-2xl font-bold text-foreground">
                        {stats.totalCorrect}
                      </Text>
                    </View>
                    
                    <View className="items-center">
                      <View className="flex-row items-center gap-2 mb-1">
                        <View 
                          className="h-3 w-3 rounded-full" 
                          style={{ backgroundColor: isDarkColorScheme ? '#ef4444' : '#dc2626' }}
                        />
                        <Text className="text-sm font-medium text-foreground">
                          Incorrect
                        </Text>
                      </View>
                      <Text className="text-2xl font-bold text-foreground">
                        {stats.totalIncorrect}
                      </Text>
                    </View>
                  </View>
                </View>
              </Card>

              {/* Achievement Highlights */}
              {stats.perfectSubtopics > 0 && (
                <Card className="mb-4">
                  <View className="p-6">
                    <View className="flex-row items-center gap-2 mb-3">
                      <Award size={20} className="text-yellow-500" />
                      <Text className="text-lg font-semibold text-foreground">
                        Achievements
                      </Text>
                    </View>
                    <View 
                      className="p-4 rounded-lg flex-row items-center gap-3"
                      style={{ backgroundColor: isDarkColorScheme ? '#fef3c7' : '#fffbeb' }}
                    >
                      <Trophy size={24} color="#f59e0b" />
                      <View className="flex-1">
                        <Text className="text-sm font-semibold" style={{ color: '#92400e' }}>
                          Perfect Score!
                        </Text>
                        <Text className="text-xs" style={{ color: '#92400e' }}>
                          You got 100% in {stats.perfectSubtopics} subtopic{stats.perfectSubtopics !== 1 ? 's' : ''}
                        </Text>
                      </View>
                    </View>
                  </View>
                </Card>
              )}

              {/* Strong Areas */}
              {stats.strongCount > 0 && (
                <Card className="mb-4">
                  <View className="p-6">
                    <View className="flex-row items-center gap-2 mb-3">
                      <Trophy size={20} color={isDarkColorScheme ? '#22c55e' : '#16a34a'} />
                      <Text className="text-lg font-semibold text-foreground">
                        Strong Performance
                      </Text>
                    </View>
                    <View 
                      className="p-4 rounded-lg"
                      style={{ backgroundColor: isDarkColorScheme ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.05)' }}
                    >
                      <Text className="text-3xl font-bold text-center mb-2" style={{ color: isDarkColorScheme ? '#22c55e' : '#16a34a' }}>
                        {stats.strongCount}
                      </Text>
                      <Text className="text-sm text-center" style={{ color: isDarkColorScheme ? '#22c55e' : '#16a34a' }}>
                        Subtopic{stats.strongCount !== 1 ? 's' : ''} where you're performing strongly
                      </Text>
                    </View>
                  </View>
                </Card>
              )}

              {/* Weak Areas */}
              {stats.weakCount > 0 && (
                <Card className="mb-4">
                  <View className="p-6">
                    <View className="flex-row items-center gap-2 mb-3">
                      <TrendingUp size={20} color={isDarkColorScheme ? '#f59e0b' : '#d97706'} />
                      <Text className="text-lg font-semibold text-foreground">
                        Areas to Improve
                      </Text>
                    </View>
                    <View 
                      className="p-4 rounded-lg"
                      style={{ backgroundColor: isDarkColorScheme ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.05)' }}
                    >
                      <Text className="text-3xl font-bold text-center mb-2" style={{ color: isDarkColorScheme ? '#f59e0b' : '#d97706' }}>
                        {stats.weakCount}
                      </Text>
                      <Text className="text-sm text-center mb-3" style={{ color: isDarkColorScheme ? '#f59e0b' : '#d97706' }}>
                        Subtopic{stats.weakCount !== 1 ? 's' : ''} that need more practice
                      </Text>
                      <View 
                        className="mt-2 p-3 rounded-lg"
                        style={{ backgroundColor: isDarkColorScheme ? '#fef3c7' : '#fffbeb' }}
                      >
                        <Text className="text-xs text-center" style={{ color: '#92400e' }}>
                          💡 Tip: Focus on these areas in your next study session. Try the simplified or story versions!
                        </Text>
                      </View>
                    </View>
                  </View>
                </Card>
              )}

              {/* Recommendations */}
              <Card className="mb-6">
                <View className="p-6">
                  <View className="flex-row items-center gap-2 mb-3">
                    <Target size={20} className="text-primary" />
                    <Text className="text-lg font-semibold text-foreground">
                      Recommendations
                    </Text>
                  </View>
                  <Text className="text-sm text-muted-foreground leading-relaxed">
                    {stats.overallScore >= 90
                      ? "Excellent work! You've mastered this topic. Consider moving on to more advanced topics or helping others learn."
                      : stats.overallScore >= 75
                      ? "Great progress! Review the areas where you made mistakes and take another test to aim for 90%+."
                      : stats.overallScore >= 60
                      ? "You're making progress! Focus on your weak areas and try the simplified or story versions of the content."
                      : "Keep practicing! Review all the content carefully, especially the areas you struggled with. Don't hesitate to regenerate content with specific questions."}
                  </Text>
                </View>
              </Card>
            </View>
          </ScrollView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}
