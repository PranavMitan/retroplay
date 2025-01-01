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

interface VideoDetailsResponse {
  items: {
    id: string;
    status: {
      uploadStatus: string;
      privacyStatus: string;
      embeddable: boolean;
    };
    contentDetails: {
      regionRestriction?: {
        blocked?: string[];
        allowed?: string[];
      };
    };
  }[];
}

async function shouldRefreshCache(): Promise<boolean> {
  const lastVideo = await Video.findOne().sort({ createdAt: -1 });
  if (!lastVideo) return true;
  
  const timeSinceLastUpdate = Date.now() - lastVideo.createdAt.getTime();
  return timeSinceLastUpdate > CACHE_DURATION;
}

async function checkVideoAvailability(videoIds: string[]): Promise<string[]> {
  try {
    const response = await axios.get<VideoDetailsResponse>(
      'https://www.googleapis.com/youtube/v3/videos',
      {
        params: {
          part: 'status,contentDetails',
          id: videoIds.join(','),
          key: process.env.YOUTUBE_API_KEY
        }
      }
    );

    return response.data.items
      .filter(item => {
        // Check if video is public, embeddable, and not region restricted
        const isPublic = item.status.privacyStatus === 'public';
        const isEmbeddable = item.status.embeddable;
        const hasNoRestrictions = !item.contentDetails.regionRestriction;
        const isAvailableGlobally = hasNoRestrictions || 
          (!item.contentDetails.regionRestriction?.blocked?.length && 
           !item.contentDetails.regionRestriction?.allowed?.length);

        return isPublic && isEmbeddable && isAvailableGlobally;
      })
      .map(item => item.id);
  } catch (error) {
    console.error('Error checking video availability:', error);
    return [];
  }
}

export async function fetchAndCacheVideos() {
  console.log('Checking cache status...');
  
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

    // Get all video IDs
    const videoIds = response.data.items.map(item => item.id.videoId);
    
    // Check availability for all videos
    const availableVideoIds = await checkVideoAvailability(videoIds);
    console.log(`Found ${availableVideoIds.length} available videos out of ${videoIds.length}`);

    // Filter and map only available videos
    const newVideos = response.data.items
      .filter(item => availableVideoIds.includes(item.id.videoId))
      .map(item => ({
        videoId: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        publishedAt: new Date(item.snippet.publishedAt),
        createdAt: new Date()
      }));

    if (newVideos.length > 0) {
      await Video.deleteMany({});
      await Video.insertMany(newVideos);
      console.log(`Cached ${newVideos.length} available videos`);
    } else {
      console.log('No available videos found to cache');
    }

  } catch (error) {
    console.error('Error fetching videos:', error);
    throw error;
  }
}

export async function initializeVideoCache() {
  const count = await Video.countDocuments();
  if (count === 0 || await shouldRefreshCache()) {
    console.log('Initializing video cache...');
    await fetchAndCacheVideos();
  } else {
    console.log('Video cache is already initialized');
  }
} 