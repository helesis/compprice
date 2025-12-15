import mongoose from 'mongoose';

const priceSchema = new mongoose.Schema({
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: true,
  },
  platform: {
    type: String,
    enum: ['booking', 'airbnb', 'expedia', 'agoda', 'hotels.com', 'competitor'],
    required: true,
  },
  roomType: String,
  price: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: 'USD',
  },
  checkInDate: Date,
  checkOutDate: Date,
  occupancy: {
    adults: Number,
    children: Number,
  },
  availability: Boolean,
  rating: Number,
  reviews: Number,
  scrapedAt: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

// Create index for efficient queries
priceSchema.index({ hotelId: 1, platform: 1, createdAt: -1 });

export const Price = mongoose.model('Price', priceSchema);
