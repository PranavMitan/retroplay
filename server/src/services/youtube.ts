import axios from 'axios';
import { Video } from '../models/Video';

const API_KEY = process.env.YOUTUBE_API_KEY;

interface YouTubeResponse {
  items: {
    id: { videoId: string };
    snippet: {
      title: string;
      description: string;
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
            q: `${topic} shorts`,
            type: 'video',
            videoDuration: 'short',
            key: process.env.YOUTUBE_API_KEY
          }
        }
      );

      console.log(`Found ${response.data.items.length} videos for ${topic}`);
      const videos = response.data.items.filter(item => {
        const title = item.snippet.title.toLowerCase();
        const description = item.snippet.description.toLowerCase();
        return isEducational(title) || isEducational(description);
      });
      console.log(`${videos.length} videos passed educational filter`);

      // Save to database
      for (const video of videos) {
        await Video.findOneAndUpdate(
          { videoId: video.id.videoId },
          {
            videoId: video.id.videoId,
            title: video.snippet.title,
            description: video.snippet.description,
            category: topic
          },
          { upsert: true }
        );
      }
      console.log(`Saved videos for topic: ${topic}`);
    }
  } catch (error) {
    console.error('Error fetching videos:', error);
    throw error;  // Re-throw to handle in the route
  }
}

function isEducational(text: string): boolean {
  const eduKeywords = ['learn', 'education', 'fact', 'tutorial', 'explain'];
  return eduKeywords.some(keyword => text.includes(keyword));
} 