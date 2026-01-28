export const getPerformanceColor = (status: string) => {
  switch (status) {
    case 'strong': return 'text-green-600';
    case 'weak': return 'text-red-600';
    case 'neutral': return 'text-yellow-600';
    default: return 'text-gray-600';
  }
};

export const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'basic': return { bg: 'bg-green-500', text: 'text-white' };
    case 'intermediate': return { bg: 'bg-amber-500', text: 'text-white' };
    case 'advanced': return { bg: 'bg-red-500', text: 'text-white' };
    default: return { bg: 'bg-gray-500', text: 'text-white' };
  }
};

export const isCUID = (id: string): boolean => {
  return id.length >= 24 && /^c[a-z0-9]+$/.test(id);
};

export const getSubtopicContent = (subtopic: any, version: string) => {
  switch (version) {
    case 'simplified':
      return {
        explanation: subtopic.explanationSimplified || subtopic.explanationDefault || '',
        example: subtopic.exampleSimplified || subtopic.example,
      };
    case 'story':
      return {
        explanation: subtopic.explanationStory || subtopic.explanationDefault || '',
        example: subtopic.exampleStory || subtopic.example,
      };
    default:
      return {
        explanation: subtopic.explanationDefault || '',
        example: subtopic.example,
      };
  }
};
