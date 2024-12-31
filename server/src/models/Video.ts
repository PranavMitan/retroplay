import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema({
  videoId: {
    type: String,
    required: true,
    unique: true
  },
  title: String,
  description: String,
  category: String,
  fetchedAt: {
    type: Date,
    default: Date.now
  }
});

export const Video = mongoose.model('Video', videoSchema); 