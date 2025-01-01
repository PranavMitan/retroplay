import { Router, RequestHandler } from 'express';
import { Video } from '../models/Video';
import { fetchAndCacheVideos } from '../services/youtube';

const router = Router();

const getRandomVideo: RequestHandler = async (_req, res, next): Promise<void> => {
  try {
    console.log('Fetching random video...');
    const count = await Video.countDocuments();
    console.log(`Found ${count} videos in database`);
    
    if (count === 0) {
      console.log('Database empty, fetching new videos...');
      await fetchAndCacheVideos();
      // Check again after fetching
      const newCount = await Video.countDocuments();
      if (newCount === 0) {
        res.status(404).json({ message: 'No videos available' });
        return;
      }
    }
    
    const random = Math.floor(Math.random() * count);
    const video = await Video.findOne().skip(random);

    if (!video) {
      console.log('No video found');
      res.status(404).json({ message: 'No videos found' });
      return;
    }

    console.log('Sending video:', video.videoId);
    res.json(video);
  } catch (error) {
    console.error('Error in getRandomVideo:', error);
    next(error);
  }
};

router.get('/random', getRandomVideo);

export const videoRouter = router; 