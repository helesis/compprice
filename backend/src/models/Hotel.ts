import mongoose from 'mongoose';

const hotelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: false, // Frontend'den gelmeyebilir, competitors'tan otomatik oluşturulabilir
  },
  address: String, // Opsiyonel
  city: {
    type: String,
    required: false, // Opsiyonel
  },
  country: String,
  latitude: Number,
  longitude: Number,
  rating: Number, // Opsiyonel
  competitors: [
    {
      name: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
      platform: {
        type: String,
        enum: ['booking', 'expedia', 'airbnb', 'agoda', 'hotels.com', 'competitor'],
        default: 'competitor',
      },
      externalId: String,
      // Rakip otel scraping için custom selector'lar
      scrapingMethod: {
        type: String,
        enum: ['auto', 'custom', 'structured-data'],
        default: 'auto',
      },
      customSelectors: {
        priceSelector: String,
      },
      lastScrapedAt: Date,
      lastScrapedPrice: Number,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export const Hotel = mongoose.model('Hotel', hotelSchema);
