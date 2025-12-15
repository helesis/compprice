import express, { Request, Response } from 'express';
import { Price } from '../models/Price';

const router = express.Router();

// Get prices for a hotel with optional filters
router.get('/hotel/:hotelId', async (req: Request, res: Response) => {
  try {
    const { days = 30, platform } = req.query;

    const query: any = {
      hotelId: req.params.hotelId,
      createdAt: {
        $gte: new Date(Date.now() - parseInt(days as string) * 24 * 60 * 60 * 1000),
      },
    };

    if (platform) {
      query.platform = platform;
    }

    const prices = await Price.find(query).sort({ createdAt: -1 });
    res.json(prices);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Get price comparison for a hotel (latest prices from all platforms)
router.get('/comparison/:hotelId', async (req: Request, res: Response) => {
  try {
    const prices = await Price.aggregate([
      {
        $match: {
          hotelId: require('mongoose').Types.ObjectId(req.params.hotelId),
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: '$platform',
          latestPrice: { $first: '$price' },
          latestDate: { $first: '$createdAt' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
          platform: { $first: '$platform' },
        },
      },
      {
        $sort: { latestPrice: 1 },
      },
    ]);

    res.json(prices);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Get price trends
router.get('/trends/:hotelId', async (req: Request, res: Response) => {
  try {
    const { days = 30, platform } = req.query;

    const query: any = {
      hotelId: require('mongoose').Types.ObjectId(req.params.hotelId),
      createdAt: {
        $gte: new Date(Date.now() - parseInt(days as string) * 24 * 60 * 60 * 1000),
      },
    };

    if (platform) {
      query.platform = platform;
    }

    const trends = await Price.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            date: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
            },
            platform: '$platform',
          },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
      { $sort: { '_id.date': 1 } },
    ]);

    res.json(trends);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Get prices for 2026 year (for future date chart)
router.get('/year-2026/:hotelId', async (req: Request, res: Response) => {
  try {
    const startDate = new Date('2026-01-01');
    const endDate = new Date('2026-12-31T23:59:59');

    const prices = await Price.find({
      hotelId: req.params.hotelId,
      $or: [
        { checkInDate: { $gte: startDate, $lte: endDate } },
        { createdAt: { $gte: startDate, $lte: endDate } },
      ],
    })
      .sort({ checkInDate: 1, createdAt: 1 })
      .select('platform price checkInDate createdAt currency');

    res.json(prices);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Record new price (for manual scraping)
router.post('/', async (req: Request, res: Response) => {
  try {
    const price = new Price(req.body);
    await price.save();
    res.status(201).json(price);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

export default router;
