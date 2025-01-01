import mongoose from 'mongoose';

interface YouTubeQuota {
  date: string;
  count: number;
}

export class MonitoringService {
  private static instance: MonitoringService;
  private youtubeQuota: Map<string, number>;
  private readonly YOUTUBE_DAILY_QUOTA = 10000;

  private constructor() {
    this.youtubeQuota = new Map();
    this.setupMongooseMonitoring();
  }

  public static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }

  private setupMongooseMonitoring() {
    mongoose.connection.on('error', error => {
      console.error('MongoDB Error:', error);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB Disconnected. Attempting to reconnect...');
    });

    mongoose.set('debug', (collectionName: string, method: string, query: any, doc: any) => {
      console.log(`MongoDB: ${collectionName}.${method}`, {
        query,
        doc: doc ? '(document)' : undefined,
        timestamp: new Date().toISOString()
      });
    });
  }

  public async getDatabaseStats() {
    if (!mongoose.connection.db) {
      throw new Error('Database not connected');
    }
    
    const stats = await mongoose.connection.db.stats();
    return {
      collections: stats.collections,
      objects: stats.objects,
      avgObjSize: stats.avgObjSize,
      dataSize: stats.dataSize,
      storageSize: stats.storageSize,
      indexes: stats.indexes,
      timestamp: new Date().toISOString()
    };
  }

  public trackYouTubeAPICall(cost: number = 1) {
    const today = new Date().toISOString().split('T')[0];
    const currentCount = this.youtubeQuota.get(today) || 0;
    const newCount = currentCount + cost;
    
    this.youtubeQuota.set(today, newCount);
    
    console.log('YouTube API Usage:', {
      date: today,
      quotaUsed: newCount,
      quotaRemaining: this.YOUTUBE_DAILY_QUOTA - newCount,
      timestamp: new Date().toISOString()
    });

    if (newCount > this.YOUTUBE_DAILY_QUOTA * 0.8) {
      console.warn(`WARNING: YouTube API quota usage is at ${Math.round(newCount/this.YOUTUBE_DAILY_QUOTA*100)}%`);
    }

    return newCount;
  }

  public getYouTubeQuotaUsage(): YouTubeQuota {
    const today = new Date().toISOString().split('T')[0];
    return {
      date: today,
      count: this.youtubeQuota.get(today) || 0
    };
  }
} 