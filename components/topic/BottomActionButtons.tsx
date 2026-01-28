import React from 'react';
import { View, Pressable } from 'react-native';
import { Text } from '@/components/ui/text';
import { BookOpen, Sparkles, Rocket } from 'lucide-react-native';

interface BottomActionButtonsProps {
  isDarkColorScheme: boolean;
  isGeneratingQuiz: boolean;
  onTakeTest: () => void;
  onAnalyze: () => void;
}

export function BottomActionButtons({
  isDarkColorScheme,
  isGeneratingQuiz,
  onTakeTest,
  onAnalyze,
}: BottomActionButtonsProps) {
  return (
    <View className="mt-8 mb-6">
      <View className="flex-row items-center gap-3">
        <Pressable
          onPress={onTakeTest}
          disabled={isGeneratingQuiz}
          className="flex-1"
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            paddingVertical: 14,
            borderRadius: 6,
            backgroundColor: isGeneratingQuiz 
              ? (isDarkColorScheme ? '#27272a' : '#e4e4e7')
              : (isDarkColorScheme ? '#18181b' : '#f4f4f5'),
            opacity: isGeneratingQuiz ? 0.7 : 1,
          }}
        >
          {isGeneratingQuiz ? (
            <>
              <View className="h-5 w-5 items-center justify-center">
                <Rocket 
                  size={16} 
                  color={isDarkColorScheme ? '#a1a1aa' : '#71717a'} 
                  style={{ transform: [{ rotate: '-45deg' }] }}
                />
              </View>
              <Text style={{ fontSize: 14, fontWeight: '600', color: isDarkColorScheme ? '#a1a1aa' : '#71717a', letterSpacing: 0.3 }}>
                Preparing Quiz...
              </Text>
            </>
          ) : (
            <>
              <BookOpen size={16} color={isDarkColorScheme ? '#fafafa' : '#18181b'} strokeWidth={2.5} />
              <Text style={{ fontSize: 14, fontWeight: '600', color: isDarkColorScheme ? '#fafafa' : '#18181b', letterSpacing: 0.3 }}>
                Take a Test
              </Text>
            </>
          )}
        </Pressable>
        
        <Pressable
          onPress={onAnalyze}
          className="flex-1"
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            paddingVertical: 14,
            borderRadius: 6,
            backgroundColor: isDarkColorScheme ? '#18181b' : '#f4f4f5',
          }}
        >
          <Sparkles size={16} color={isDarkColorScheme ? '#fafafa' : '#18181b'} strokeWidth={2.5} />
          <Text style={{ fontSize: 14, fontWeight: '600', color: isDarkColorScheme ? '#fafafa' : '#18181b', letterSpacing: 0.3 }}>
            Analyze
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
