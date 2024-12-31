import { Router, RequestHandler } from 'express';
import { Video } from '../models/Video';

const router = Router();

const getRandomVideo: RequestHandler = async (_req, res, next) => {
  try {
    const count = await Video.countDocuments();
    const random = Math.floor(Math.random() * count);
    const video = await Video.findOne().skip(random);

    if (!video) {
      res.status(404).json({ message: 'No videos found' });
      return;
    }

    res.json(video);
  } catch (error) {
    next(error);
  }
};

router.get('/random', getRandomVideo);

export const videoRouter = router; 