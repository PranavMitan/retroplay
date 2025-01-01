import axios from 'axios';
import { Video } from '../models/Video';

const API_KEY = process.env.YOUTUBE_API_KEY;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

interface YouTubeResponse {
  items: {
    id: { videoId: string };
    snippet: {
      title: string;
      description: string;
      publishedAt: string;
    };
  }[];
}

async function shouldRefreshCache(): Promise<boolean> {
  const lastVideo = await Video.findOne().sort({ createdAt: -1 });
  if (!lastVideo) return true;
  
  const timeSinceLastUpdate = Date.now() - lastVideo.createdAt.getTime();
  return timeSinceLastUpdate > CACHE_DURATION;
}

export async function fetchAndCacheVideos() {
  console.log('Checking cache status...');
  
  // Only refresh if cache is empty or old
  if (!(await shouldRefreshCache())) {
    console.log('Cache is still valid, skipping refresh');
    return;
  }

  console.log('Starting to fetch videos...');

  try {
    const response = await axios.get<YouTubeResponse>(
      `https://www.googleapis.com/youtube/v3/search`,
      {
        params: {
          part: 'snippet',
          maxResults: 50,
          q: 'music|song|concert|live performance',
          type: 'video',
          videoCategoryId: '10',
          videoDefinition: 'any',
          publishedBefore: '2011-01-01T00:00:00Z',
          key: process.env.YOUTUBE_API_KEY
        }
      }
    );

    if (!response.data.items?.length) {
      console.log('No videos found in API response');
      return;
    }

    // Don't clear old videos until we have new ones
    const newVideos = response.data.items.map(item => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      publishedAt: new Date(item.snippet.publishedAt),
      createdAt: new Date()
    }));

    // Only clear old videos if we have new ones
    if (newVideos.length > 0) {
      await Video.deleteMany({});
      await Video.insertMany(newVideos);
      console.log(`Cached ${newVideos.length} new videos`);
    }

  } catch (error) {
    console.error('Error fetching videos:', error);
    throw error;
  }
}

// Initialize cache on server start
export async function initializeVideoCache() {
  const count = await Video.countDocuments();
  if (count === 0 || await shouldRefreshCache()) {
    console.log('Initializing video cache...');
    await fetchAndCacheVideos();
  } else {
    console.log('Video cache is already initialized');
  }
} 