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
  const topics = [
    'science facts',
    'history explained',
    'math concepts',
    // ... other topics
  ];

  try {
    for (const topic of topics) {
      const response = await axios.get<YouTubeResponse>(
        `https://www.googleapis.com/youtube/v3/search`,
        {
          params: {
            part: 'snippet',
            maxResults: 50,
            q: `${topic} shorts`,
            type: 'video',
            videoDuration: 'short',
            key: API_KEY
          }
        }
      );

      const videos = response.data.items.filter(item => {
        const title = item.snippet.title.toLowerCase();
        const description = item.snippet.description.toLowerCase();
        return isEducational(title) || isEducational(description);
      });

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
    }
  } catch (error) {
    console.error('Error fetching videos:', error);
  }
}

function isEducational(text: string): boolean {
  const eduKeywords = ['learn', 'education', 'fact', 'tutorial', 'explain'];
  return eduKeywords.some(keyword => text.includes(keyword));
} 