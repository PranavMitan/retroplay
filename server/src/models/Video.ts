import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema({
  videoId: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  category: String,
  publishedAt: {
    type: Date,
    required: true
  }
});

export const Video = mongoose.model('Video', videoSchema); 