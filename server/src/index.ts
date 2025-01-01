import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { videoRouter } from './routes/videos';
import { initializeVideoCache } from './services/youtube';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/retro-shorts')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Initialize video cache on startup
    try {
      await initializeVideoCache();
      console.log('Video cache initialized');
    } catch (error) {
      console.error('Failed to initialize video cache:', error);
    }
  })
  .catch(error => {
    console.error('MongoDB connection error:', error);
  });

app.use('/api/videos', videoRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 