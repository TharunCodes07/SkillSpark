import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, Loader2 } from 'lucide-react-native';
import type { ContentVersion } from './types';

interface FailedTones {
  default?: boolean;
  simplified?: boolean;
  story?: boolean;
}

interface FailedTonesWarningProps {
  failedTones: FailedTones;
  isRegeneratingTone: (tone: ContentVersion) => boolean;
  onRegenerateContent: (tone: ContentVersion) => void;
}

export function FailedTonesWarning({
  failedTones,
  isRegeneratingTone,
  onRegenerateContent,
}: FailedTonesWarningProps) {
  if (!failedTones || (!failedTones.default && !failedTones.simplified && !failedTones.story)) {
    return null;
  }

  return (
    <Card className="bg-yellow-50 border-yellow-200">
      <CardContent className="p-4">
        <View className="flex-row items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
          <View className="flex-1">
            <Text className="text-sm font-semibold text-yellow-900 mb-2">
              Some content failed to generate
            </Text>
            
            <View className="space-y-2">
              {failedTones.default && (
                <View className="flex-row items-center justify-between bg-yellow-100 rounded-lg p-2">
                  <Text className="text-xs text-yellow-800">Default content failed</Text>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-7 px-2"
                    onPress={() => onRegenerateContent('default')}
                    disabled={isRegeneratingTone('default')}
                  >
                    {isRegeneratingTone('default') ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <RefreshCw className="h-3 w-3 mr-1" />
                    )}
                    <Text className="text-xs">
                      {isRegeneratingTone('default') ? 'Regenerating...' : 'Regenerate'}
                    </Text>
                  </Button>
                </View>
              )}
              
              {failedTones.simplified && (
                <View className="flex-row items-center justify-between bg-yellow-100 rounded-lg p-2">
                  <Text className="text-xs text-yellow-800">Simplified content failed</Text>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-7 px-2"
                    onPress={() => onRegenerateContent('simplified')}
                    disabled={isRegeneratingTone('simplified')}
                  >
                    {isRegeneratingTone('simplified') ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <RefreshCw className="h-3 w-3 mr-1" />
                    )}
                    <Text className="text-xs">
                      {isRegeneratingTone('simplified') ? 'Regenerating...' : 'Regenerate'}
                    </Text>
                  </Button>
                </View>
              )}
              
              {failedTones.story && (
                <View className="flex-row items-center justify-between bg-yellow-100 rounded-lg p-2">
                  <Text className="text-xs text-yellow-800">Story content failed</Text>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-7 px-2"
                    onPress={() => onRegenerateContent('story')}
                    disabled={isRegeneratingTone('story')}
                  >
                    {isRegeneratingTone('story') ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <RefreshCw className="h-3 w-3 mr-1" />
                    )}
                    <Text className="text-xs">
                      {isRegeneratingTone('story') ? 'Regenerating...' : 'Regenerate'}
                    </Text>
                  </Button>
                </View>
              )}
            </View>
            
            <Text className="text-xs text-yellow-600 mt-2">
              Switch to working styles or regenerate failed content above.
            </Text>
          </View>
        </View>
      </CardContent>
    </Card>
  );
}
