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
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/hotels', hotelRoutes);
app.use('/api/prices', priceRoutes);
app.use('/api/scrapers', scraperRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/compprice')
  .then(() => {
    logger.info('✅ MongoDB bağlantısı başarılı');
    // Start scheduler AFTER MongoDB connection is established
    startScheduler(logger);
  })
  .catch((err) => {
    logger.error('❌ MongoDB bağlantı hatası:', err);
  });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`🚀 Sunucu ${PORT} portunda çalışıyor`);
});

export default app;
