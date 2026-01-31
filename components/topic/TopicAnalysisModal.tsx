import React, { useMemo } from 'react';
import { Modal, View, Pressable, ScrollView } from 'react-native';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import { X, Trophy, Target, TrendingUp, AlertCircle, Award, Calendar, ChevronRight, BarChart3 } from 'lucide-react-native';
import Animated, { FadeIn, FadeOut, SlideInRight } from 'react-native-reanimated';
// @ts-ignore - No type declarations available
import { PieChart, LineChart } from 'react-native-gifted-charts';
import { useTopicQuizAttempts } from '@/hooks/queries/useRoadmapQueries';

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
  topicId: string;
  topicName: string;
  userId: string;
  subtopicPerformance: Map<string, SubtopicPerformance>;
  subtopicNames: Map<string, string>; // Map of subtopicId to subtopic name
  onClose: () => void;
  onViewQuizResults: (quizId: string) => void;
}

export function TopicAnalysisModal({
  visible,
  isDarkColorScheme,
  topicId,
  topicName,
  userId,
  subtopicPerformance,
  subtopicNames,
  onClose,
  onViewQuizResults,
}: TopicAnalysisModalProps) {
  
  // Fetch quiz attempts for this topic
  const { data: quizAttempts = [], isLoading: isLoadingAttempts } = useTopicQuizAttempts(topicId, userId);

  // Debug: Log raw quiz attempts
  console.log('🔍 Raw Quiz Attempts:', quizAttempts);

  // Filter and validate quiz attempts - remove invalid data
  const validQuizAttempts = useMemo(() => {
    if (quizAttempts.length === 0) {
      console.log('📭 No quiz attempts found');
      return [];
    }
    
    const invalid: any[] = [];
    const valid = quizAttempts.filter(attempt => {
      // Score is now a percentage (0-100), correctCount is the actual correct answers
      const scorePercentage = attempt.scorePercentage ?? 0;
      const correctCount = attempt.correctCount ?? 0;
      
      console.log('🧪 Validating attempt:', {
        quizId: attempt.quizId,
        scorePercentage,
        correctCount,
        totalQuestions: attempt.totalQuestions,
        completedAt: attempt.completedAt,
        completedAtType: typeof attempt.completedAt,
      });
      
      // Validate that percentage is within valid range (0-100)
      const isValidScore = scorePercentage >= 0 && scorePercentage <= 100;
      // Validate that correctCount doesn't exceed total questions
      const isValidCorrectCount = correctCount <= attempt.totalQuestions && correctCount >= 0;
      // Validate that totalQuestions is positive
      const isValidTotal = attempt.totalQuestions > 0;
      // Validate date - handle both Date objects and strings
      const isValidDate = attempt.completedAt && (
        attempt.completedAt instanceof Date 
          ? !isNaN(attempt.completedAt.getTime())
          : !isNaN(new Date(attempt.completedAt).getTime())
      );
      
      console.log('✅ Validation result:', { isValidScore, isValidCorrectCount, isValidTotal, isValidDate });
      
      const isValid = isValidScore && isValidCorrectCount && isValidTotal && isValidDate;
      
      if (!isValid) {
        invalid.push({
          quizId: attempt.quizId,
          reason: !isValidScore ? `Invalid score percentage: ${scorePercentage}%` :
                  !isValidCorrectCount ? `Correct count ${correctCount} exceeds ${attempt.totalQuestions} questions` : 
                  !isValidTotal ? 'No questions found' : 
                  'Invalid or corrupted date',
        });
      }
      
      return isValid;
    });
    
    if (invalid.length > 0) {
      console.warn('⚠️ Invalid quiz attempts found:', invalid);
    }
    
    console.log('✅ Valid quiz attempts:', valid.length, 'out of', quizAttempts.length);
    
    return valid;
  }, [quizAttempts]);

  // Check if there are invalid attempts
  const hasInvalidData = useMemo(() => {
    return quizAttempts.length > validQuizAttempts.length;
  }, [quizAttempts.length, validQuizAttempts.length]);

  const invalidDataCount = quizAttempts.length - validQuizAttempts.length;

  // Generate colors for subtopics
  const subtopicColors = useMemo(() => {
    const colors = [
      '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981',
      '#3b82f6', '#14b8a6', '#f97316', '#84cc16', '#a855f7'
    ];
    const colorMap = new Map<string, string>();
    Array.from(subtopicPerformance.keys()).forEach((id, index) => {
      colorMap.set(id, colors[index % colors.length]);
    });
    return colorMap;
  }, [subtopicPerformance]);

  // Prepare subtopic breakdown pie chart data
  const subtopicPieData = useMemo(() => {
    const data: any[] = [];
    subtopicPerformance.forEach((perf, subtopicId) => {
      if (perf.totalAttempts > 0) {
        const name = subtopicNames.get(subtopicId) || 'Unknown';
        const shortName = name.length > 20 ? name.substring(0, 18) + '...' : name;
        data.push({
          value: perf.totalAttempts,
          color: subtopicColors.get(subtopicId),
          text: `${perf.totalAttempts}`,
          label: shortName,
        });
      }
    });
    return data;
  }, [subtopicPerformance, subtopicNames, subtopicColors]);

  // Prepare performance over time line chart data
  const performanceTimelineData = useMemo(() => {
    if (validQuizAttempts.length === 0) return [];
    
    // Sort by date (oldest first)
    const sorted = [...validQuizAttempts].reverse();
    
    return sorted.map((attempt, index) => {
      // Use scorePercentage directly - it's already a percentage (0-100)
      const percentage = attempt.scorePercentage ?? 0;
      
      // Clamp percentage between 0 and 100 (safety check)
      const clampedPercentage = Math.max(0, Math.min(100, percentage));
      
      return {
        value: clampedPercentage,
        label: `#${index + 1}`,
        dataPointText: `${clampedPercentage}%`,
        dataPointColor: clampedPercentage >= 70 
          ? (isDarkColorScheme ? '#22c55e' : '#16a34a')
          : (isDarkColorScheme ? '#f59e0b' : '#d97706'),
      };
    });
  }, [validQuizAttempts, isDarkColorScheme]);
  
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
              
              {/* Data Issue Warning - only show if there are invalid entries */}
              {hasInvalidData && (
                <Card className="mb-4">
                  <View 
                    className="p-4"
                    style={{ backgroundColor: isDarkColorScheme ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.05)' }}
                  >
                    <View className="flex-row items-start gap-3">
                      <AlertCircle size={20} color={isDarkColorScheme ? '#f59e0b' : '#d97706'} />
                      <View className="flex-1">
                        <Text className="text-sm font-medium mb-1" style={{ color: isDarkColorScheme ? '#f59e0b' : '#d97706' }}>
                          {invalidDataCount} quiz result{invalidDataCount !== 1 ? 's' : ''} hidden
                        </Text>
                        <Text className="text-xs" style={{ color: isDarkColorScheme ? '#fcd34d' : '#92400e' }}>
                          Some results have missing data (invalid dates or no questions). Only complete results are shown.
                        </Text>
                      </View>
                    </View>
                  </View>
                </Card>
              )}
              
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
                          <Text className="text-2xl font-bold text-foreground text-black-200">
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

              {/* Subtopic Breakdown - Pie Chart */}
              {subtopicPieData.length > 0 && (
                <Card className="mb-4">
                  <View className="p-6">
                    <View className="flex-row items-center gap-2 mb-4">
                      <BarChart3 size={20} className="text-primary" />
                      <Text className="text-lg font-semibold text-foreground">
                        Questions by Subtopic
                      </Text>
                    </View>
                    
                    <View className="items-center py-4">
                      <PieChart
                        data={subtopicPieData}
                        donut
                        radius={90}
                        innerRadius={60}
                        centerLabelComponent={() => (
                          <View className="items-center">
                            <Text className="text-2xl font-bold text-foreground text-black-200">
                              {stats.attemptedSubtopics}
                            </Text>
                            <Text className="text-xs text-muted-foreground">
                              Subtopics
                            </Text>
                          </View>
                        )}
                      />
                    </View>

                    <View className="mt-4 gap-2">
                      {Array.from(subtopicPerformance.entries()).map(([subtopicId, perf]) => {
                        const name = subtopicNames.get(subtopicId) || 'Unknown';
                        const color = subtopicColors.get(subtopicId);
                        return (
                          <View key={subtopicId} className="flex-row items-center justify-between py-2">
                            <View className="flex-row items-center gap-2 flex-1">
                              <View 
                                className="h-3 w-3 rounded-full" 
                                style={{ backgroundColor: color }}
                              />
                              <Text className="text-sm text-foreground flex-1" numberOfLines={1}>
                                {name}
                              </Text>
                            </View>
                            <View className="flex-row items-center gap-2">
                              <Text className="text-sm font-semibold text-foreground">
                                {perf.accuracy}%
                              </Text>
                              <Text className="text-xs text-muted-foreground">
                                ({perf.correctCount}/{perf.totalAttempts})
                              </Text>
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                </Card>
              )}

              {/* Performance Over Time - Line Chart */}
              

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

              {/* Quiz History */}
              {validQuizAttempts.length > 0 && (
                <Card className="mb-4">
                  <View className="p-6">
                    <View className="flex-row items-center gap-2 mb-4">
                      <Calendar size={20} className="text-primary" />
                      <Text className="text-lg font-semibold text-foreground">
                        Quiz History
                      </Text>
                    </View>
                    
                    <View className="gap-3">
                      {validQuizAttempts.map((attempt, index) => {
                        // Use scorePercentage directly - it's already a percentage (0-100)
                        const percentage = attempt.scorePercentage ?? 0;
                        const correctCount = attempt.correctCount ?? 0;
                        const isRecent = index === 0;
                        
                        return (
                          <Pressable
                            key={attempt.quizId + attempt.completedAt.toString()}
                            onPress={() => onViewQuizResults(attempt.quizId)}
                            className="p-4 rounded-lg border border-border bg-card active:opacity-70"
                            style={{
                              backgroundColor: isRecent 
                                ? isDarkColorScheme ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.05)'
                                : isDarkColorScheme ? '#1a1a1a' : '#ffffff'
                            }}
                          >
                            <View className="flex-row items-center justify-between">
                              <View className="flex-1 mr-3">
                                <View className="flex-row items-center gap-2 mb-1">
                                  {isRecent && (
                                    <View 
                                      className="px-2 py-0.5 rounded"
                                      style={{ backgroundColor: isDarkColorScheme ? '#6366f1' : '#6366f1' }}
                                    >
                                      <Text className="text-[10px] font-semibold text-white">
                                        LATEST
                                      </Text>
                                    </View>
                                  )}
                                  <Text className="text-sm font-semibold text-foreground">
                                    Quiz #{validQuizAttempts.length - index}
                                  </Text>
                                </View>
                                <Text className="text-xs text-muted-foreground mb-2">
                                  {new Date(attempt.completedAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </Text>
                                <View className="flex-row items-center gap-3">
                                  <Text 
                                    className="text-lg font-bold"
                                    style={{
                                      color: percentage >= 70 
                                        ? (isDarkColorScheme ? '#22c55e' : '#16a34a')
                                        : (isDarkColorScheme ? '#f59e0b' : '#d97706')
                                    }}
                                  >
                                    {percentage}%
                                  </Text>
                                  <Text className="text-xs text-muted-foreground">
                                    {correctCount}/{attempt.totalQuestions} correct
                                  </Text>
                                  {attempt.passed && (
                                    <View className="flex-row items-center gap-1">
                                      <Trophy size={14} color={isDarkColorScheme ? '#22c55e' : '#16a34a'} />
                                      <Text className="text-xs" style={{ color: isDarkColorScheme ? '#22c55e' : '#16a34a' }}>
                                        Passed
                                      </Text>
                                    </View>
                                  )}
                                </View>
                              </View>
                              <ChevronRight size={20} className="text-muted-foreground" />
                            </View>
                          </Pressable>
                        );
                      })}
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
