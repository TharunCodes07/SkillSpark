import React from 'react';
import { Modal, View, Pressable } from 'react-native';
import { Text } from '@/components/ui/text';
import { Sparkles, X } from 'lucide-react-native';
import Animated, { FadeIn, FadeOut, ZoomIn } from 'react-native-reanimated';

interface PerformanceChangeModalProps {
  visible: boolean;
  isDarkColorScheme: boolean;
  onYes: () => void;
  onNo: () => void;
}

export function PerformanceChangeModal({
  visible,
  isDarkColorScheme,
  onYes,
  onNo,
}: PerformanceChangeModalProps) {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onNo}
      statusBarTranslucent
    >
      <Animated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(200)}
        className="flex-1 items-center justify-center px-6"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
      >
        <Pressable 
          className="absolute inset-0" 
          onPress={onNo}
        />
        
        <Animated.View
          entering={ZoomIn.duration(300).springify()}
          className="w-full max-w-sm rounded-2xl overflow-hidden"
          style={{
            backgroundColor: isDarkColorScheme ? '#18181b' : '#ffffff',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.3,
            shadowRadius: 20,
            elevation: 10,
          }}
        >
          <View className="p-6">
            {/* Icon and Title */}
            <View className="items-center mb-4">
              <View 
                className="h-16 w-16 items-center justify-center rounded-full mb-4"
                style={{ backgroundColor: isDarkColorScheme ? '#6366f1' : '#eef2ff' }}
              >
                <Sparkles size={32} color={isDarkColorScheme ? '#ffffff' : '#6366f1'} />
              </View>
              <Text className="text-xl font-bold text-foreground text-center mb-2">
                Performance Update
              </Text>
              <Text className="text-sm text-muted-foreground text-center leading-relaxed">
                Your quiz performance has been recorded. Would you like to generate personalized content based on your results?
              </Text>
            </View>

            {/* Benefits */}
            <View 
              className="mb-6 p-3 rounded-lg"
              style={{ backgroundColor: isDarkColorScheme ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.05)' }}
            >
              <Text className="text-xs text-muted-foreground mb-1">
                 Personalized learning material
              </Text>
              <Text className="text-xs text-muted-foreground mb-1">
                 Focus on your weak areas
              </Text>
              <Text className="text-xs text-muted-foreground">
                 Adapted to your level
              </Text>
            </View>

            {/* Action Buttons */}
            <View className="space-y-3 ">
              <Pressable
                onPress={onYes}
                className="w-full h-12 items-center justify-center rounded-lg active:opacity-90 mb-2"
                style={{ backgroundColor: isDarkColorScheme ? '#6366f1' : '#4f46e5' }}
              >
                <Text className="text-base font-semibold text-white">
                  Yes, Generate Content
                </Text>
              </Pressable>

              <Pressable
                onPress={onNo}
                className="w-full h-12 items-center justify-center rounded-lg border active:bg-secondary"
                style={{ borderColor: isDarkColorScheme ? '#3f3f46' : '#e4e4e7' }}
              >
                <Text className="text-base font-medium text-foreground">
                  No, Keep Current Content
                </Text>
              </Pressable>
            </View>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}
