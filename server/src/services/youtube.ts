import axios from 'axios';
import { Video } from '../models/Video';
import rateLimit from 'express-rate-limit';
import { MonitoringService } from '../utils/monitoring';

const API_KEY = process.env.YOUTUBE_API_KEY;
const CACHE_DURATION = 24 * 60 * 60 * 1000;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

const monitoring = MonitoringService.getInstance();

interface YouTubeResponse {
  items: Array<{
    id: { videoId: string };
    snippet: {
      title: string;
      description: string;
      publishedAt: string;
    };
  }>;
}

interface VideoDetailsResponse {
  items: Array<{
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
  }>;
}

// Rate limiter for API requests
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function retryOperation<T>(
  operation: () => Promise<T>
): Promise<T> {
  let lastError: Error | null = null;
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      console.log(`Retrying operation, ${MAX_RETRIES - i - 1} attempts remaining`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
    }
  }
  throw lastError;
}

async function shouldRefreshCache(): Promise<boolean> {
  try {
    const lastVideo = await Video.findOne().sort({ createdAt: -1 });
    if (!lastVideo) return true;
    
    const timeSinceLastUpdate = Date.now() - lastVideo.createdAt.getTime();
    return timeSinceLastUpdate > CACHE_DURATION;
  } catch (error) {
    console.error('Error checking cache status:', error);
    return true; // Refresh cache on error
  }
}

async function checkVideoAvailability(videoIds: string[]): Promise<string[]> {
  try {
    // Cost: 1 unit per video ID, up to 50 IDs
    monitoring.trackYouTubeAPICall(Math.ceil(videoIds.length / 50));
    
    const response = await retryOperation(() => 
      Promise.resolve(axios.get<VideoDetailsResponse>(
        'https://www.googleapis.com/youtube/v3/videos',
        {
          params: {
            part: 'status,contentDetails',
            id: videoIds.join(','),
            key: process.env.YOUTUBE_API_KEY
          }
        }
      ))
    );

    return response.data.items
      .filter(item => {
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
  
  try {
    if (!(await shouldRefreshCache())) {
      console.log('Cache is still valid, skipping refresh');
      return;
    }

    console.log('Starting to fetch videos...');

    // Cost: 100 units for search
    monitoring.trackYouTubeAPICall(100);
    
    const response = await retryOperation(() =>
      Promise.resolve(axios.get<YouTubeResponse>(
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
      ))
    );

    if (!response.data.items?.length) {
      console.log('No videos found in API response');
      return;
    }

    const videoIds = response.data.items.map(item => item.id.videoId);
    const availableVideoIds = await checkVideoAvailability(videoIds);
    console.log(`Found ${availableVideoIds.length} available videos out of ${videoIds.length}`);

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
      const session = await Video.startSession();
      try {
        await session.withTransaction(async () => {
          await Video.deleteMany({}, { session });
          await Video.insertMany(newVideos, { session });
        });
        console.log(`Cached ${newVideos.length} available videos`);
      } catch (error) {
        console.error('Transaction failed:', error);
        throw error;
      } finally {
        await session.endSession();
      }
    } else {
      console.log('No available videos found to cache');
    }

  } catch (error) {
    console.error('Error fetching videos:', error);
    throw error;
  }
}

export async function initializeVideoCache() {
  try {
    const count = await Video.countDocuments();
    if (count === 0 || await shouldRefreshCache()) {
      console.log('Initializing video cache...');
      await fetchAndCacheVideos();
    } else {
      console.log('Video cache is already initialized');
    }
  } catch (error) {
    console.error('Failed to initialize cache:', error);
    throw error;
  }
} 