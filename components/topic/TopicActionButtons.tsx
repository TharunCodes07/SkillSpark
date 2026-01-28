import React from 'react';
import { View, Pressable, ActivityIndicator } from 'react-native';
import { Text } from '@/components/ui/text';
import { Search, MessageSquare } from 'lucide-react-native';

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
  return (
    <View className="flex-row items-center gap-2 mb-4">
      <Pressable
        onPress={onSearch}
        disabled={isSearching}
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
          opacity: isSearching ? 0.7 : 1,
        }}
      >
        {isSearching ? (
          <>
            <ActivityIndicator size="small" color={isDarkColorScheme ? '#6366f1' : '#4f46e5'} />
            <Text style={{ fontSize: 13, fontWeight: '500', color: isDarkColorScheme ? '#fafafa' : '#18181b' }}>
              Searching...
            </Text>
          </>
        ) : (
          <>
            <Search size={16} color={isDarkColorScheme ? '#a1a1aa' : '#52525b'} />
            <Text style={{ fontSize: 13, fontWeight: '500', color: isDarkColorScheme ? '#fafafa' : '#18181b' }}>
              Search Updates
            </Text>
          </>
        )}
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
