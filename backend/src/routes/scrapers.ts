import express, { Request, Response } from 'express';
import { Hotel } from '../models/Hotel';
import { BookingScraper } from '../scrapers/BookingScraper';
import { ExpediaScraper } from '../scrapers/ExpediaScraper';
import { CompetitorHotelScraper } from '../scrapers/CompetitorHotelScraper';
import { setupLogger } from '../utils/logger';

const router = express.Router();
const logger = setupLogger();

// Manually trigger scraping for a hotel
router.post('/scrape/:hotelId', async (req: Request, res: Response) => {
  try {
    const hotelId = req.params.hotelId;
    if (!hotelId) {
      return res.status(400).json({ error: 'Hotel ID is required' });
    }
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(404).json({ error: 'Hotel not found' });
    }

    const bookingScraper = new BookingScraper(logger);
    const expediaScraper = new ExpediaScraper(logger);
    const competitorScraper = new CompetitorHotelScraper(logger);

    const results: any[] = [];
    const competitors = Array.isArray(hotel.competitors) ? hotel.competitors : [];

    for (const competitor of competitors) {
      try {
        if (!competitor.url) {
          logger.warn(`Competitor URL is empty for platform ${competitor.platform}`);
          continue;
        }
        
        let scraperResult;

        if (competitor.platform === 'booking') {
          scraperResult = await bookingScraper.scrapeHotelPrice(competitor.url);
        } else if (competitor.platform === 'expedia') {
          scraperResult = await expediaScraper.scrapeHotelPrice(competitor.url);
        } else if (competitor.platform === 'competitor') {
          // Rakip otel direkt sitesi - otomatik scrape
          scraperResult = await competitorScraper.scrapeCompetitorHotel(
            competitor.url || '',
            competitor.name
          );
        }

        if (scraperResult) {
          results.push({
            competitorName: competitor.name,
            ...scraperResult,
          });
        }
      } catch (error) {
        logger.error(`Error scraping ${competitor.name}:`, error);
        results.push({
          competitorName: competitor.name,
          error: (error as Error).message,
        });
      }
    }

    res.json({ hotelId, results });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Get scraping status
router.get('/status', async (req: Request, res: Response) => {
  res.json({
    status: 'active',
    lastRun: new Date(),
    nextRun: new Date(Date.now() + 60 * 60 * 1000), // Next hour
  });
});

export default router;
