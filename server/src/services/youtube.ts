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
  const topics = ['educational'];

  try {
    console.log('Using API key:', process.env.YOUTUBE_API_KEY?.slice(0, 5) + '...');
    
    for (const topic of topics) {
      console.log('Fetching old videos...');
      const response = await axios.get<YouTubeResponse>(
        `https://www.googleapis.com/youtube/v3/search`,
        {
          params: {
            part: 'snippet',
            maxResults: 50,
            q: 'uploaded:2005-01-01..2010-12-31',
            type: 'video',
            order: 'date',
            publishedBefore: '2011-01-01T00:00:00Z',
            key: process.env.YOUTUBE_API_KEY
          }
        }
      );

      console.log(`Found ${response.data.items.length} old videos`);
      
      // Save all pre-2010 videos without additional filtering
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
        }
      }
      console.log('Saved old videos to database');
    }
  } catch (error: any) {
    console.error('Error fetching videos:', error.response?.data || error.message);
    throw error;
  }
} 