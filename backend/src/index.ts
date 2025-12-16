import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { setupLogger } from './utils/logger';
import { startScheduler } from './utils/scheduler';
import hotelRoutes from './routes/hotels';
import priceRoutes from './routes/prices';
import scraperRoutes from './routes/scrapers';

dotenv.config();

const app = express();
const logger = setupLogger();

// Middleware
// CORS configuration for production (Render)
// Allow multiple origins for flexibility
const allowedOrigins: string[] = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'https://compprice-frontend.onrender.com',
  'https://*.onrender.com', // Allow all Render subdomains
].filter((origin): origin is string => Boolean(origin)); // Remove undefined values

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // In production, be more permissive for Render deployments
    if (process.env.NODE_ENV === 'production') {
      // Allow all Render subdomains
      if (origin && origin.includes('.onrender.com')) {
        callback(null, true);
        return;
      }
    }
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // Log the blocked origin for debugging
      logger.warn(`CORS blocked origin: ${origin}`);
      callback(null, true); // Temporarily allow all for debugging
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use('/api/hotels', hotelRoutes);
app.use('/api/prices', priceRoutes);
app.use('/api/scrapers', scraperRoutes);

// Health check
app.get('/health', (req: express.Request, res: express.Response) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    environment: process.env.NODE_ENV || 'development'
  });
});

// API root endpoint
app.get('/api', (req: express.Request, res: express.Response) => {
  res.json({ 
    message: 'CompPrice API',
    version: '1.0.0',
    endpoints: {
      hotels: '/api/hotels',
      prices: '/api/prices',
      scrapers: '/api/scrapers',
      health: '/health'
    }
  });
});

// Start server first (even if MongoDB fails, server should be accessible)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`🚀 Sunucu ${PORT} portunda çalışıyor`);
  logger.info(`📍 Health check: http://localhost:${PORT}/health`);
});

// MongoDB Connection (non-blocking - server runs even if MongoDB fails)
const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  logger.error('❌ MONGODB_URI environment variable tanımlı değil!');
  logger.warn('⚠️  Server çalışıyor ama MongoDB olmadan bazı özellikler çalışmayabilir');
} else if (!mongoUri.startsWith('mongodb://') && !mongoUri.startsWith('mongodb+srv://')) {
  logger.error(`❌ MONGODB_URI geçersiz format! 'mongodb://' veya 'mongodb+srv://' ile başlamalı`);
  logger.error(`❌ Mevcut değer: ${mongoUri.substring(0, 20)}...`);
  logger.warn('⚠️  Server çalışıyor ama MongoDB olmadan bazı özellikler çalışmayabilir');
} else {
  mongoose.connect(mongoUri)
    .then(() => {
      logger.info('✅ MongoDB bağlantısı başarılı');
      // Start scheduler AFTER MongoDB connection is established
      startScheduler(logger);
    })
    .catch((err) => {
      logger.error('❌ MongoDB bağlantı hatası:', err);
      logger.warn('⚠️  Server çalışıyor ama MongoDB olmadan bazı özellikler çalışmayabilir');
    });
}

export default app;
