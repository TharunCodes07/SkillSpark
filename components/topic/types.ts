import type { TopicExplanation } from '@/lib/gemini';
import type { SubtopicPerformance } from '@/hooks/queries/useTopicQueries';

export type ContentVersion = 'default' | 'simplified' | 'story';

export interface TopicData {
  id: string;
  name: string;
  category: string;
}

export interface TopicDetailData {
  topic: TopicData;
  explanation: TopicExplanation;
  subtopicPerformance: Map<string, SubtopicPerformance>;
}

export interface SubtopicContent {
  explanation: string;
  example?: string;
}

export interface EmotionCallbackProps {
  emotion: string;
  confidence: number;
}
