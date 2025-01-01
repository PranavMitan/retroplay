import axios from 'axios';
import { Video } from '../models/Video';

const API_KEY = process.env.YOUTUBE_API_KEY;

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

async function clearDatabase() {
  console.log('Clearing database...');
  await Video.deleteMany({});
  console.log('Database cleared');
}

export async function fetchAndCacheVideos() {
  await clearDatabase();
  console.log('Starting to fetch videos...');

  try {
    console.log('Using API key:', process.env.YOUTUBE_API_KEY?.slice(0, 5) + '...');
    
    const response = await axios.get<YouTubeResponse>(
      `https://www.googleapis.com/youtube/v3/search`,
      {
        params: {
          part: 'snippet',
          maxResults: 50,
          q: 'music',  // Simple query to test
          type: 'video',
          videoDefinition: 'any',
          publishedBefore: '2011-01-01T00:00:00Z',
          key: process.env.YOUTUBE_API_KEY
        }
      }
    );

    console.log('API Response:', {
      totalResults: response.data.items?.length || 0,
      firstVideo: response.data.items?.[0]?.snippet || 'No videos found'
    });

    // Save all pre-2010 videos
    let savedCount = 0;
    for (const video of response.data.items) {
      const publishDate = new Date(video.snippet.publishedAt);
      if (publishDate <= new Date('2010-12-31T23:59:59Z')) {
        await Video.findOneAndUpdate(
          { videoId: video.id.videoId },
          {
            videoId: video.id.videoId,
            title: video.snippet.title,
            description: video.snippet.description,
            category: 'classic',
            publishedAt: video.snippet.publishedAt
          },
          { upsert: true }
        );
        savedCount++;
      }
    }
    console.log(`Saved ${savedCount} videos to database`);

  } catch (error: any) {
    console.error('YouTube API Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw error;
  }
} 