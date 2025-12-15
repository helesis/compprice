import express, { Request, Response } from 'express';
import { Hotel } from '../models/Hotel';
import { CompetitorHotelScraper } from '../scrapers/CompetitorHotelScraper';
import { Price } from '../models/Price';
import { setupLogger } from '../utils/logger';

const router = express.Router();
const logger = setupLogger();
const scraper = new CompetitorHotelScraper(logger);

// Get all hotels
router.get('/', async (req: Request, res: Response) => {
  try {
    const hotels = await Hotel.find();
    res.json(hotels);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Get single hotel with latest prices
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) {
      return res.status(404).json({ error: 'Hotel not found' });
    }
    res.json(hotel);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Create new hotel
router.post('/', async (req: Request, res: Response) => {
  try {
    // En az bir rakip otel gerekli
    if (!req.body.competitors || req.body.competitors.length === 0) {
      return res.status(400).json({ error: 'En az bir rakip otel gereklidir' });
    }

    // Hotel name otomatik oluştur (ilk rakip'ten)
    if (!req.body.name && req.body.competitors[0]?.name) {
      req.body.name = req.body.competitors[0].name;
    }

    const hotel = new Hotel(req.body);
    await hotel.save();

    // Rakip otellerin fiyatlarını hemen scrape et (arka planda)
    const competitors = Array.isArray(hotel.competitors) ? hotel.competitors : [];
    competitors.forEach((competitor: any) => {
      scrapeCompetitorPrice(hotel._id.toString(), competitor).catch((error) => {
        logger.error(`Failed to scrape ${competitor.url}: ${error.message}`);
      });
    });

    res.status(201).json(hotel);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// Async scraping helper function
async function scrapeCompetitorPrice(hotelId: string, competitor: any) {
  try {
    const priceData = await scraper.scrapeCompetitorHotel(competitor.url, competitor.name);
    
    // Fiyat bilgisini kaydet
    const price = new Price({
      hotelId: hotelId,
      platform: 'competitor',
      price: priceData.price,
      currency: priceData.currency,
      availability: priceData.availability,
      scrapedAt: new Date(),
    });
    
    await price.save();
    
    // Competitor'ın lastScrapedPrice'ını güncelle
    await Hotel.findByIdAndUpdate(
      hotelId,
      {
        'competitors.$[elem].lastScrapedPrice': priceData.price,
        'competitors.$[elem].lastScrapedAt': new Date(),
      },
      {
        arrayFilters: [{ 'elem.url': competitor.url }],
        new: true,
      }
    );

    logger.info(`Scraped price for ${competitor.name}: $${priceData.price}`);
  } catch (error) {
    logger.error(`Error scraping ${competitor.url}: ${(error as Error).message}`);
  }
}

// Update hotel
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const hotel = await Hotel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!hotel) {
      return res.status(404).json({ error: 'Hotel not found' });
    }
    res.json(hotel);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// Delete hotel
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const hotel = await Hotel.findByIdAndDelete(req.params.id);
    if (!hotel) {
      return res.status(404).json({ error: 'Hotel not found' });
    }
    res.json({ message: 'Hotel deleted' });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
