import React from 'react';
import { View, Pressable } from 'react-native';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
// import { AlertCircle, CheckCircle2 } from 'lucide-react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

interface MessageBannersProps {
  errorMessage: string | null;
  successMessage: string | null;
  onDismissError: () => void;
  onDismissSuccess: () => void;
}

export function MessageBanners({
  errorMessage,
  successMessage,
  onDismissError,
  onDismissSuccess,
}: MessageBannersProps) {
  return (
    <>
      {errorMessage && (
        <Animated.View entering={FadeIn.duration(300)} exiting={FadeOut.duration(200)}>
          <Card className="bg-destructive/10 border-destructive">
            <View className="p-4 flex-row items-start gap-3">
              {/* <AlertCircle size={20} className="text-destructive mt-0.5" /> */}
              <View className="flex-1">
                <Text className="text-sm text-destructive font-medium mb-2">
                  {errorMessage}
                </Text>
                <Pressable
                  onPress={onDismissError}
                  className="self-start"
                >
                  <Text className="text-xs text-destructive/80 font-medium">Dismiss</Text>
                </Pressable>
              </View>
            </View>
          </Card>
        </Animated.View>
      )}

      {successMessage && (
        <Animated.View entering={FadeIn.duration(300)} exiting={FadeOut.duration(200)}>
          <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <View className="p-4 flex-row items-start gap-3">
              {/* <CheckCircle2 size={20} className="text-green-600 dark:text-green-400 mt-0.5" /> */}
              <View className="flex-1">
                <Text className="text-sm text-green-700 dark:text-green-300 font-medium mb-2">
                  {successMessage}
                </Text>
                <Pressable
                  onPress={onDismissSuccess}
                  className="self-start"
                >
                  <Text className="text-xs text-green-600 dark:text-green-400 font-medium">Dismiss</Text>
                </Pressable>
              </View>
            </View>
          </Card>
        </Animated.View>
      )}
    </>
  );
}
