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

export async function fetchAndCacheVideos() {
  console.log('Starting to fetch videos...');
  const topics = [
    'science facts',
    'history explained',
    'math concepts',
    'educational shorts',
    'learning facts',
    'did you know facts'
  ];

  try {
    console.log('Using API key:', process.env.YOUTUBE_API_KEY?.slice(0, 5) + '...');
    
    for (const topic of topics) {
      console.log(`Fetching videos for topic: ${topic}`);
      const response = await axios.get<YouTubeResponse>(
        `https://www.googleapis.com/youtube/v3/search`,
        {
          params: {
            part: 'snippet',
            maxResults: 50,
            q: `${topic} before:2010`,
            type: 'video',
            order: 'date',
            publishedBefore: '2011-01-01T00:00:00Z',
            key: process.env.YOUTUBE_API_KEY
          }
        }
      );

      console.log(`Found ${response.data.items.length} videos for ${topic}`);
      const videos = response.data.items.filter(item => {
        const title = item.snippet.title.toLowerCase();
        const description = item.snippet.description.toLowerCase();
        const publishDate = new Date(item.snippet.publishedAt);
        return (isEducational(title) || isEducational(description)) && 
               publishDate <= new Date('2010-12-31T23:59:59Z');
      });
      console.log(`${videos.length} videos passed educational and date filter`);

      // Save to database with publish date
      for (const video of videos) {
        await Video.findOneAndUpdate(
          { videoId: video.id.videoId },
          {
            videoId: video.id.videoId,
            title: video.snippet.title,
            description: video.snippet.description,
            category: topic,
            publishedAt: video.snippet.publishedAt
          },
          { upsert: true }
        );
      }
      console.log(`Saved videos for topic: ${topic}`);
    }
  } catch (error: any) {
    console.error('Error fetching videos:', error.response?.data || error.message);
    throw error;
  }
}

function isEducational(text: string): boolean {
  const eduKeywords = ['learn', 'education', 'fact', 'tutorial', 'explain'];
  return eduKeywords.some(keyword => text.includes(keyword));
} 