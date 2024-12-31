import express from 'express';
import cors from 'cors';
import cron from 'node-cron';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fetchAndCacheVideos } from './services/youtube.js';
import { videoRouter } from './routes/videos.js';

dotenv.config();

const app = express();
app.use(cors({
  origin: ['http://localhost:5000', 'https://youtube-shorts-player.onrender.com']
}));
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI!, {
  serverSelectionTimeoutMS: 30000, // 30 seconds
  socketTimeoutMS: 45000, // 45 seconds
  connectTimeoutMS: 30000, // 30 seconds
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/videos', videoRouter);

// Fetch videos every 6 hours
cron.schedule('0 */6 * * *', async () => {
  console.log('Fetching new videos...');
  await fetchAndCacheVideos();
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 