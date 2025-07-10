import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchUser } from "./user-queries";

const ROADMAPS_KEY = "@SkillSpark_roadmaps";
const ACTIVE_ROADMAP_KEY = "@SkillSpark_active_roadmap";

export interface UserPreferences {
  depth: "Fast" | "Balanced" | "Detailed";
  videoLength: "Short" | "Medium" | "Long";
}

export interface PlaylistItem {
  id: string;
  title: string;
  videoUrl: string;
  duration?: string;
  description?: string;
}

export interface RoadmapPoint {
  id: string;
  title: string;
  description: string;
  level: "beginner" | "intermediate" | "advanced";
  playlists: PlaylistItem[] | null;
  isCompleted?: boolean;
  order: number;
}

export interface Roadmap {
  id: string;
  topic: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  points: RoadmapPoint[];
  progress?: {
    completedPoints: number;
    totalPoints: number;
    percentage: number;
  };
}

async function getUserPreferencesWithDefaults(): Promise<UserPreferences> {
  try {
    const user = await fetchUser();
    return (
      user?.preferences || {
        depth: "Balanced",
        videoLength: "Medium",
      }
    );
  } catch (error) {
    console.error("Error fetching user preferences:", error);
    return {
      depth: "Balanced",
      videoLength: "Medium",
    };
  }
}

export async function generateRoadmapFromBackend(
  topic: string
): Promise<Roadmap> {
  try {
    const preferences = await getUserPreferencesWithDefaults();

    const response = await fetch(
      "http://192.168.175.222:8001/api/roadmaps/generate",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic,
          userPreferences: preferences,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error?.message || "Failed to generate roadmap");
    }

    return result.data;
  } catch (error) {
    console.error("Error generating roadmap from backend:", error);
    throw error;
  }
}

export async function saveRoadmap(roadmap: Roadmap): Promise<void> {
  try {
    const existingRoadmaps = await getAllRoadmaps();
    const updatedRoadmaps = existingRoadmaps.filter((r) => r.id !== roadmap.id);
    updatedRoadmaps.push(roadmap);

    await AsyncStorage.setItem(ROADMAPS_KEY, JSON.stringify(updatedRoadmaps));
  } catch (error) {
    console.error("Error saving roadmap:", error);
    throw error;
  }
}

export async function getAllRoadmaps(): Promise<Roadmap[]> {
  try {
    const roadmapsData = await AsyncStorage.getItem(ROADMAPS_KEY);
    const roadmaps = roadmapsData ? JSON.parse(roadmapsData) : [];
    return Array.isArray(roadmaps) ? roadmaps : [];
  } catch (error) {
    console.error("Error fetching roadmaps:", error);
    return [];
  }
}

export async function getRoadmapById(id: string): Promise<Roadmap | null> {
  try {
    const roadmaps = await getAllRoadmaps();
    return roadmaps.find((roadmap) => roadmap.id === id) || null;
  } catch (error) {
    console.error("Error fetching roadmap by ID:", error);
    return null;
  }
}

export async function deleteRoadmap(id: string): Promise<void> {
  try {
    const roadmaps = await getAllRoadmaps();
    const filteredRoadmaps = roadmaps.filter((roadmap) => roadmap.id !== id);
    await AsyncStorage.setItem(ROADMAPS_KEY, JSON.stringify(filteredRoadmaps));

    const activeRoadmap = await getActiveRoadmap();
    if (activeRoadmap?.id === id) {
      await clearActiveRoadmap();
    }
  } catch (error) {
    console.error("Error deleting roadmap:", error);
    throw error;
  }
}

export async function setActiveRoadmap(roadmap: Roadmap): Promise<void> {
  try {
    await AsyncStorage.setItem(ACTIVE_ROADMAP_KEY, JSON.stringify(roadmap));
    await saveRoadmap(roadmap);
  } catch (error) {
    console.error("Error setting active roadmap:", error);
    throw error;
  }
}

export async function getActiveRoadmap(): Promise<Roadmap | null> {
  try {
    const activeRoadmapData = await AsyncStorage.getItem(ACTIVE_ROADMAP_KEY);
    return activeRoadmapData ? JSON.parse(activeRoadmapData) : null;
  } catch (error) {
    console.error("Error fetching active roadmap:", error);
    return null;
  }
}

export async function clearActiveRoadmap(): Promise<void> {
  try {
    await AsyncStorage.removeItem(ACTIVE_ROADMAP_KEY);
  } catch (error) {
    console.error("Error clearing active roadmap:", error);
    throw error;
  }
}

export async function updateRoadmapProgress(
  roadmapId: string,
  pointId: string,
  isCompleted: boolean
): Promise<void> {
  try {
    const roadmap = await getRoadmapById(roadmapId);
    if (!roadmap) {
      throw new Error("Roadmap not found");
    }

    const pointIndex = roadmap.points.findIndex(
      (point) => point.id === pointId
    );
    if (pointIndex !== -1) {
      roadmap.points[pointIndex].isCompleted = isCompleted;
    }

    const completedPoints = roadmap.points.filter(
      (point) => point.isCompleted
    ).length;
    const totalPoints = roadmap.points.length;
    const percentage =
      totalPoints > 0 ? Math.round((completedPoints / totalPoints) * 100) : 0;

    roadmap.progress = {
      completedPoints,
      totalPoints,
      percentage,
    };

    roadmap.updatedAt = new Date().toISOString();

    await saveRoadmap(roadmap);

    const activeRoadmap = await getActiveRoadmap();
    if (activeRoadmap?.id === roadmapId) {
      await setActiveRoadmap(roadmap);
    }
  } catch (error) {
    console.error("Error updating roadmap progress:", error);
    throw error;
  }
}

export async function getRoadmapProgress(roadmapId: string): Promise<{
  completedPoints: number;
  totalPoints: number;
  percentage: number;
} | null> {
  try {
    const roadmap = await getRoadmapById(roadmapId);
    if (!roadmap) {
      return null;
    }

    const completedPoints = roadmap.points.filter(
      (point) => point.isCompleted
    ).length;
    const totalPoints = roadmap.points.length;
    const percentage =
      totalPoints > 0 ? Math.round((completedPoints / totalPoints) * 100) : 0;

    return {
      completedPoints,
      totalPoints,
      percentage,
    };
  } catch (error) {
    console.error("Error fetching roadmap progress:", error);
    return null;
  }
}

export async function updatePlaylistItem(
  roadmapId: string,
  pointId: string,
  playlistItem: PlaylistItem
): Promise<void> {
  try {
    const roadmap = await getRoadmapById(roadmapId);
    if (!roadmap) {
      throw new Error("Roadmap not found");
    }

    const pointIndex = roadmap.points.findIndex(
      (point) => point.id === pointId
    );
    if (pointIndex === -1) {
      throw new Error("Roadmap point not found");
    }

    if (!roadmap.points[pointIndex].playlists) {
      roadmap.points[pointIndex].playlists = [];
    }

    const playlists = roadmap.points[pointIndex].playlists!;
    const playlistIndex = playlists.findIndex(
      (item) => item.id === playlistItem.id
    );

    if (playlistIndex !== -1) {
      playlists[playlistIndex] = playlistItem;
    } else {
      playlists.push(playlistItem);
    }

    roadmap.updatedAt = new Date().toISOString();
    await saveRoadmap(roadmap);

    const activeRoadmap = await getActiveRoadmap();
    if (activeRoadmap?.id === roadmapId) {
      await setActiveRoadmap(roadmap);
    }
  } catch (error) {
    console.error("Error updating playlist item:", error);
    throw error;
  }
}

export async function getPlaylistsForPoint(
  roadmapId: string,
  pointId: string
): Promise<PlaylistItem[]> {
  try {
    const roadmap = await getRoadmapById(roadmapId);
    if (!roadmap) {
      return [];
    }

    const point = roadmap.points.find((point) => point.id === pointId);
    return point?.playlists || [];
  } catch (error) {
    console.error("Error fetching playlists for point:", error);
    return [];
  }
}

export async function initializePlaylistsForPoint(
  roadmapId: string,
  pointId: string,
  playlists: PlaylistItem[]
): Promise<void> {
  try {
    const roadmap = await getRoadmapById(roadmapId);
    if (!roadmap) {
      throw new Error("Roadmap not found");
    }

    const pointIndex = roadmap.points.findIndex(
      (point) => point.id === pointId
    );
    if (pointIndex === -1) {
      throw new Error("Roadmap point not found");
    }

    roadmap.points[pointIndex].playlists = playlists;
    roadmap.updatedAt = new Date().toISOString();

    await saveRoadmap(roadmap);

    const activeRoadmap = await getActiveRoadmap();
    if (activeRoadmap?.id === roadmapId) {
      await setActiveRoadmap(roadmap);
    }
  } catch (error) {
    console.error("Error initializing playlists for point:", error);
    throw error;
  }
}

export async function arePlaylistsLoadedForPoint(
  roadmapId: string,
  pointId: string
): Promise<boolean> {
  try {
    const roadmap = await getRoadmapById(roadmapId);
    if (!roadmap) {
      return false;
    }

    const point = roadmap.points.find((point) => point.id === pointId);
    return point?.playlists !== null && point?.playlists !== undefined;
  } catch (error) {
    console.error("Error checking if playlists are loaded:", error);
    return false;
  }
}

export async function generatePlaylistsFromBackend(
  topic: string,
  pointTitle: string
): Promise<PlaylistItem[]> {
  try {
    const preferences = await getUserPreferencesWithDefaults();

    const response = await fetch(
      "http://192.168.175.222:8001/api/playlists/generate",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic,
          pointTitle,
          userPreferences: preferences,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error?.message || "Failed to generate playlists");
    }

    return result.data;
  } catch (error) {
    console.error("Error generating playlists from backend:", error);
    throw error;
  }
}

export async function loadPlaylistsForPoint(
  roadmapId: string,
  pointId: string,
  topic: string,
  pointTitle: string
): Promise<PlaylistItem[]> {
  try {
    const areLoaded = await arePlaylistsLoadedForPoint(roadmapId, pointId);
    if (areLoaded) {
      return await getPlaylistsForPoint(roadmapId, pointId);
    }

    const playlists = await generatePlaylistsFromBackend(topic, pointTitle);

    await initializePlaylistsForPoint(roadmapId, pointId, playlists);

    return playlists;
  } catch (error) {
    console.error("Error loading playlists for point:", error);
    throw error;
  }
}

export async function regeneratePlaylistsForPoint(
  roadmapId: string,
  pointId: string,
  topic: string,
  pointTitle: string
): Promise<PlaylistItem[]> {
  try {
    const playlists = await generatePlaylistsFromBackend(topic, pointTitle);

    await initializePlaylistsForPoint(roadmapId, pointId, playlists);

    return playlists;
  } catch (error) {
    console.error("Error regenerating playlists for point:", error);
    throw error;
  }
}

export async function generateNewRoadmap(topic: string): Promise<Roadmap> {
  try {
    const roadmap = await generateRoadmapFromBackend(topic);
    await setActiveRoadmap(roadmap);
    return roadmap;
  } catch (error) {
    console.error("Error generating new roadmap:", error);
    throw error;
  }
}

export async function searchRoadmaps(query: string): Promise<Roadmap[]> {
  try {
    const roadmaps = await getAllRoadmaps();
    const lowercaseQuery = query.toLowerCase();

    return roadmaps.filter(
      (roadmap) =>
        roadmap.topic.toLowerCase().includes(lowercaseQuery) ||
        roadmap.title.toLowerCase().includes(lowercaseQuery) ||
        roadmap.description.toLowerCase().includes(lowercaseQuery)
    );
  } catch (error) {
    console.error("Error searching roadmaps:", error);
    return [];
  }
}

export async function getRoadmapsByLevel(
  level: "beginner" | "intermediate" | "advanced"
): Promise<RoadmapPoint[]> {
  try {
    const activeRoadmap = await getActiveRoadmap();
    if (!activeRoadmap) {
      return [];
    }

    return activeRoadmap.points.filter((point) => point.level === level);
  } catch (error) {
    console.error("Error fetching roadmap points by level:", error);
    return [];
  }
}

export async function clearAllRoadmaps(): Promise<void> {
  try {
    await AsyncStorage.removeItem(ROADMAPS_KEY);
    await AsyncStorage.removeItem(ACTIVE_ROADMAP_KEY);
  } catch (error) {
    console.error("Error clearing all roadmaps:", error);
    throw error;
  }
}
