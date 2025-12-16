import express, { Request, Response } from 'express';
import { Hotel } from '../models/Hotel';
import { Price } from '../models/Price';
import { BookingScraper } from '../scrapers/BookingScraper';
import { ExpediaScraper } from '../scrapers/ExpediaScraper';
import { CompetitorHotelScraper } from '../scrapers/CompetitorHotelScraper';
import { ETSTurScraper } from '../scrapers/ETSTurScraper';
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
    const etsturScraper = new ETSTurScraper(logger);

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
        } else if (competitor.platform === 'etstur') {
          // ETS Tur için tarih bazlı scraping (varsayılan: bugünden 7 gün sonra, 7 gece)
          const checkinDate = new Date();
          checkinDate.setDate(checkinDate.getDate() + 7);
          const checkoutDate = new Date(checkinDate);
          checkoutDate.setDate(checkoutDate.getDate() + 7);
          
          const day = String(checkinDate.getDate()).padStart(2, '0');
          const month = String(checkinDate.getMonth() + 1).padStart(2, '0');
          const year = checkinDate.getFullYear();
          const checkinStr = `${day}.${month}.${year}`;
          
          const checkoutDay = String(checkoutDate.getDate()).padStart(2, '0');
          const checkoutMonth = String(checkoutDate.getMonth() + 1).padStart(2, '0');
          const checkoutYear = checkoutDate.getFullYear();
          const checkoutStr = `${checkoutDay}.${checkoutMonth}.${checkoutYear}`;
          
          scraperResult = await etsturScraper.scrapeHotelPrice(
            competitor.url,
            { checkin: checkinStr, checkout: checkoutStr, nights: 7 },
            competitor.name
          );
        } else if (competitor.platform === 'competitor') {
          // Rakip otel direkt sitesi - otomatik scrape
          scraperResult = await competitorScraper.scrapeCompetitorHotel(
            competitor.url || '',
            competitor.name
          );
        }

        if (scraperResult) {
          // Save price to database
          if (scraperResult.price > 0) {
            const price = new Price({
              hotelId: hotel._id,
              ...scraperResult,
              checkInDate: scraperResult.checkin ? parseDateTR(scraperResult.checkin) : undefined,
              checkOutDate: scraperResult.checkout ? parseDateTR(scraperResult.checkout) : undefined,
              scrapedAt: new Date(),
            });
            await price.save();
          }
          
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

// ETS Tur sezon scraping (2026 için haftalık fiyatlar)
router.post('/scrape-season/:hotelId', async (req: Request, res: Response) => {
  try {
    const hotelId = req.params.hotelId;
    const { year = 2026, nights = 7, intervalDays = 7 } = req.body;
    
    if (!hotelId) {
      return res.status(400).json({ error: 'Hotel ID is required' });
    }
    
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(404).json({ error: 'Hotel not found' });
    }

    // ETS Tur competitor bul
    const competitors = Array.isArray(hotel.competitors) ? hotel.competitors : [];
    const etsturCompetitor = competitors.find((c: any) => c.platform === 'etstur') || null;

    if (!etsturCompetitor || !etsturCompetitor.url) {
      return res.status(400).json({ error: 'ETS Tur competitor not found for this hotel' });
    }

    const etsturScraper = new ETSTurScraper(logger);
    
    // Sezon tarihleri
    const startDate = new Date(year, 0, 1); // 1 Ocak
    const endDate = new Date(year, 11, 31); // 31 Aralık

    logger.info(`🗓️  Sezon scraping başlıyor: ${hotel.name} (${year})`);
    
    const results = await etsturScraper.scrapeSeason(
      etsturCompetitor.url,
      {
        year,
        startDate,
        endDate,
        nights,
        intervalDays,
      },
      etsturCompetitor.name
    );

    // Tüm fiyatları kaydet
    const savedPrices = [];
    for (const result of results) {
      if (result.price > 0) {
        const price = new Price({
          hotelId: hotel._id,
          ...result,
          checkInDate: result.checkin ? parseDateTR(result.checkin) : undefined,
          checkOutDate: result.checkout ? parseDateTR(result.checkout) : undefined,
          scrapedAt: new Date(),
        });
        await price.save();
        savedPrices.push(price);
      }
    }

    // Competitor'ı güncelle
    await Hotel.findByIdAndUpdate(
      hotelId,
      {
        $set: {
          'competitors.$[elem].lastScrapedAt': new Date(),
          'competitors.$[elem].lastScrapedPrice': results.length > 0 
            ? results.filter(r => r.price > 0).reduce((sum, r) => sum + r.price, 0) / results.filter(r => r.price > 0).length
            : 0,
        },
      },
      {
        arrayFilters: [{ 'elem.url': etsturCompetitor.url }],
      }
    );

    res.json({
      hotelId,
      year,
      totalScraped: results.length,
      successCount: results.filter(r => r.price > 0).length,
      savedPrices: savedPrices.length,
      results: results.slice(0, 10), // İlk 10 sonuç
    });
  } catch (error) {
    logger.error('Sezon scraping hatası:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

// ETS Tur tarih bazlı scraping
router.post('/scrape-etstur/:hotelId', async (req: Request, res: Response) => {
  try {
    const hotelId = req.params.hotelId;
    const { checkin, checkout, nights = 7 } = req.body;
    
    if (!hotelId) {
      return res.status(400).json({ error: 'Hotel ID is required' });
    }
    
    if (!checkin || !checkout) {
      return res.status(400).json({ error: 'checkin and checkout dates are required (DD.MM.YYYY format)' });
    }
    
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(404).json({ error: 'Hotel not found' });
    }

    const competitors = Array.isArray(hotel.competitors) ? hotel.competitors : [];
    const etsturCompetitor = competitors.find((c: any) => c.platform === 'etstur') || null;

    if (!etsturCompetitor || !etsturCompetitor.url) {
      return res.status(400).json({ error: 'ETS Tur competitor not found for this hotel' });
    }

    const etsturScraper = new ETSTurScraper(logger);
    
    const result = await etsturScraper.scrapeHotelPrice(
      etsturCompetitor.url,
      { checkin, checkout, nights },
      etsturCompetitor.name
    );

    // Fiyatı kaydet
    if (result.price > 0) {
      const price = new Price({
        hotelId: hotel._id,
        ...result,
        checkInDate: parseDateTR(checkin),
        checkOutDate: parseDateTR(checkout),
        scrapedAt: new Date(),
      });
      await price.save();

      // Competitor'ı güncelle
      await Hotel.findByIdAndUpdate(
        hotelId,
        {
          $set: {
            'competitors.$[elem].lastScrapedPrice': result.price,
            'competitors.$[elem].lastScrapedAt': new Date(),
          },
        },
        {
          arrayFilters: [{ 'elem.url': etsturCompetitor.url }],
        }
      );
    }

    res.json({ hotelId, result });
  } catch (error) {
    logger.error('ETS Tur scraping hatası:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

// Helper function: DD.MM.YYYY formatını Date'e çevir
function parseDateTR(dateStr: string): Date {
  const [day, month, year] = dateStr.split('.');
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
}

// Get scraping status
router.get('/status', async (req: Request, res: Response) => {
  res.json({
    status: 'active',
    lastRun: new Date(),
    nextRun: new Date(Date.now() + 60 * 60 * 1000), // Next hour
  });
});

export default router;
