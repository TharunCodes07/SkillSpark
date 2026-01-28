import React from 'react';
import { View, Pressable } from 'react-native';
import { Text } from '@/components/ui/text';
import { Search, MessageSquare } from 'lucide-react-native';
import { LoadingAnimation } from '@/components/ui/loading-animation';

interface TopicActionButtonsProps {
  isSearching: boolean;
  isAskDoubtMode: boolean;
  isDarkColorScheme: boolean;
  onSearch: () => void;
  onToggleAskDoubtMode: () => void;
}

export function TopicActionButtons({
  isSearching,
  isAskDoubtMode,
  isDarkColorScheme,
  onSearch,
  onToggleAskDoubtMode,
}: TopicActionButtonsProps) {
  if (isSearching) {
    return (
      <View className="mb-4">
        <LoadingAnimation 
          title="Searching for Updates"
          messages={[
            'Searching the web for latest information...',
            'Analyzing new developments...',
            'Finding relevant updates...',
            'Almost done...'
          ]}
        />
      </View>
    );
  }

  return (
    <View className="flex-row items-center gap-2 mb-4">
      <Pressable
        onPress={onSearch}
        style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          paddingVertical: 10,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: isDarkColorScheme ? '#3f3f46' : '#e4e4e7',
          backgroundColor: isDarkColorScheme ? '#27272a' : '#ffffff',
        }}
      >
        <Search size={16} color={isDarkColorScheme ? '#a1a1aa' : '#52525b'} />
        <Text style={{ fontSize: 13, fontWeight: '500', color: isDarkColorScheme ? '#fafafa' : '#18181b' }}>
          Search Updates
        </Text>
      </Pressable>
      
      <Pressable
        onPress={onToggleAskDoubtMode}
        style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          paddingVertical: 10,
          borderRadius: 8,
          backgroundColor: isAskDoubtMode 
            ? (isDarkColorScheme ? '#6366f1' : '#4f46e5')
            : (isDarkColorScheme ? '#27272a' : '#ffffff'),
          borderWidth: isAskDoubtMode ? 0 : 1,
          borderColor: isDarkColorScheme ? '#3f3f46' : '#e4e4e7',
        }}
      >
        <MessageSquare size={16} color={isAskDoubtMode ? '#ffffff' : (isDarkColorScheme ? '#a1a1aa' : '#52525b')} />
        <Text style={{ 
          fontSize: 13, 
          fontWeight: '500', 
          color: isAskDoubtMode ? '#ffffff' : (isDarkColorScheme ? '#fafafa' : '#18181b'),
        }}>
          {isAskDoubtMode ? 'Cancel' : 'Ask a Doubt'}
        </Text>
      </Pressable>
    </View>
  );
}
