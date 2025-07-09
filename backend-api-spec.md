# Backend API Specification for SkillTrail

## 1. Generate Roadmap API ✅ IMPLEMENTED

### Endpoint: `POST /api/roadmaps/generate`

**Base URL:** `http://localhost:8001`

### Request:

```json
{
  "topic": "React Native"
}
```

### Expected Response:

```json
{
  "success": true,
  "data": {
    "id": "roadmap_1234567890",
    "topic": "React Native",
    "title": "React Native Development Roadmap",
    "description": "Complete learning path for React Native development",
    "createdAt": "2025-07-09T10:30:00.000Z",
    "updatedAt": "2025-07-09T10:30:00.000Z",
    "points": [
      {
        "id": "point_1",
        "title": "JavaScript Fundamentals",
        "description": "Master JavaScript basics before diving into React Native",
        "level": "beginner",
        "order": 1,
        "playlists": null,
        "isCompleted": false
      },
      {
        "id": "point_2",
        "title": "React Fundamentals",
        "description": "Learn React concepts and patterns",
        "level": "beginner",
        "order": 2,
        "playlists": null,
        "isCompleted": false
      },
      {
        "id": "point_3",
        "title": "React Native Navigation",
        "description": "Master navigation patterns in React Native",
        "level": "intermediate",
        "order": 3,
        "playlists": null,
        "isCompleted": false
      },
      {
        "id": "point_4",
        "title": "State Management & Performance",
        "description": "Advanced state management and optimization techniques",
        "level": "advanced",
        "order": 4,
        "playlists": null,
        "isCompleted": false
      }
    ],
    "progress": {
      "completedPoints": 0,
      "totalPoints": 4,
      "percentage": 0
    }
  }
}
```

## 2. Generate Playlists API ✅ IMPLEMENTED

### Endpoint: `POST /api/playlists/generate`

**Base URL:** `http://localhost:8001`

### Request:

```json
{
  "roadmapId": "roadmap_1234567890",
  "pointId": "point_1",
  "topic": "React Native",
  "pointTitle": "JavaScript Fundamentals"
}
```

### Expected Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "playlist_1",
      "title": "JavaScript Crash Course",
      "videoUrl": "https://youtube.com/watch?v=PkZNo7MFNFg",
      "duration": "2:30:45",
      "description": "Complete JavaScript tutorial for beginners"
    },
    {
      "id": "playlist_2",
      "title": "Advanced JavaScript Concepts",
      "videoUrl": "https://youtube.com/watch?v=hdI2bqOjy3c",
      "duration": "1:45:30",
      "description": "Learn advanced JS concepts like closures, prototypes"
    },
    {
      "id": "playlist_3",
      "title": "ES6+ Features You Need to Know",
      "videoUrl": "https://youtube.com/watch?v=NCwa_xi0Uuc",
      "duration": "1:20:15",
      "description": "Modern JavaScript features essential for React Native"
    }
  ]
}
```

## 3. Error Response Format

### When API fails:

```json
{
  "success": false,
  "error": {
    "code": "GENERATION_FAILED",
    "message": "Failed to generate roadmap for the given topic",
    "details": "The topic 'invalid topic' is not supported or too vague"
  }
}
```

## 4. Type Definitions (for reference)

```typescript
interface PlaylistItem {
  id: string;
  title: string;
  videoUrl: string;
  duration?: string;
  description?: string;
}

interface RoadmapPoint {
  id: string;
  title: string;
  description: string;
  level: "beginner" | "intermediate" | "advanced";
  playlists: PlaylistItem[] | null; // null initially, populated when user accesses
  isCompleted?: boolean;
  order: number;
}

interface Roadmap {
  id: string;
  topic: string;
  title: string;
  description: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  points: RoadmapPoint[];
  progress?: {
    completedPoints: number;
    totalPoints: number;
    percentage: number;
  };
}
```

## 5. Important Notes

### Roadmap Generation:

- Points should be ordered logically (beginner → intermediate → advanced)
- Each point should have a clear, actionable title
- Descriptions should explain what the user will learn
- Initially, all `playlists` should be `null`
- `isCompleted` should default to `false`

### Playlist Generation:

- Should return 3-5 high-quality YouTube videos
- Videos should be relevant to the specific roadmap point
- Duration format: "H:MM:SS" or "MM:SS"
- Descriptions should briefly explain what the video covers
- Video URLs should be valid YouTube links

### Error Handling:

- Always return structured error responses
- Include helpful error messages for debugging
- Handle edge cases like unsupported topics

### Performance:

- Roadmap generation should complete within 10-15 seconds
- Playlist generation should complete within 5-10 seconds
- Consider caching for popular topics

## 6. Integration Points

### Frontend Integration Status:

1. ✅ `generateNewRoadmap()` calls `generateRoadmapFromBackend()` when user submits topic
2. ✅ Returned roadmap is stored using `setActiveRoadmap()`
3. ✅ When user clicks on roadmap point, `loadPlaylistsForPoint()` is called
4. ✅ Point playlists are updated using `initializePlaylistsForPoint()`

### API Endpoints in Use:

- **Roadmap Generation:** `POST http://localhost:8001/api/roadmaps/generate`
- **Playlist Generation:** `POST http://localhost:8001/api/playlists/generate`

### Components Updated:

- ✅ `RoadmapGenerator.tsx` - Uses real backend for roadmap generation
- ✅ `roadmap-point.tsx` - Uses real backend for playlist loading
- ✅ All error handling and loading states implemented

### Frontend Functions Updated:

- ✅ `generateRoadmapFromBackend()` - Now calls real API at `http://localhost:8001/api/roadmaps/generate`
- ✅ `generatePlaylistsFromBackend()` - Now calls real API at `http://localhost:8001/api/playlists/generate`
- ✅ All components updated to use real backend instead of mock data
- ✅ Error handling implemented for API failures
