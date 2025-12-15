import cron from 'node-cron';
import { Logger } from 'winston';
import { Hotel } from '../models/Hotel';
import { Price } from '../models/Price';
import { BookingScraper } from '../scrapers/BookingScraper';
import { ExpediaScraper } from '../scrapers/ExpediaScraper';
import { CompetitorHotelScraper } from '../scrapers/CompetitorHotelScraper';

export function startScheduler(logger: Logger) {
  // Test için: Her 5 dakikada bir çalış (production'da '0 * * * *' kullan - her saat başı)
  // Production: '0 * * * *' - Her saat başı
  // Test: '*/5 * * * *' - Her 5 dakikada bir
  const cronExpression = process.env.NODE_ENV === 'production' ? '0 * * * *' : '*/5 * * * *';
  
  cron.schedule(cronExpression, async () => {
    logger.info('🔄 Otomatik scraping başlatılıyor...');
    
    try {
      const hotels = await Hotel.find();
      logger.info(`📊 ${hotels.length} otel bulundu, scraping başlıyor...`);
      
      if (hotels.length === 0) {
        logger.info('ℹ️  Scraping yapılacak otel yok');
        return;
      }
      
      let successCount = 0;
      let errorCount = 0;
      
      for (const hotel of hotels) {
        try {
          logger.info(`🏨 Otel scraping: ${hotel.name || hotel._id}`);
          const results = await scrapeHotelPrices(hotel._id.toString(), logger);
          if (results && results.length > 0) {
            successCount++;
            logger.info(`✅ ${hotel.name || hotel._id}: ${results.length} fiyat kaydedildi`);
          } else {
            logger.warn(`⚠️  ${hotel.name || hotel._id}: Fiyat bulunamadı`);
          }
        } catch (error) {
          errorCount++;
          logger.error(`❌ Otel ${hotel._id} scraping hatası:`, error);
        }
      }
      
      logger.info(`✅ Scraping tamamlandı: ${successCount} başarılı, ${errorCount} hata`);
    } catch (error) {
      logger.error('❌ Scheduler hatası:', error);
    }
  });

  const scheduleInfo = process.env.NODE_ENV === 'production' 
    ? 'her saat başı' 
    : 'her 5 dakikada bir (test modu)';
  logger.info(`⏰ Otomatik scraping zamanlayıcısı başlatıldı (${scheduleInfo})`);
}

async function scrapeHotelPrices(hotelId: string, logger: Logger) {
  if (!hotelId) {
    throw new Error('Hotel ID is required');
  }
  const hotel = await Hotel.findById(hotelId);
  
  if (!hotel) {
    throw new Error(`Hotel ${hotelId} not found`);
  }

  const bookingScraper = new BookingScraper(logger);
  const expediaScraper = new ExpediaScraper(logger);
  const competitorScraper = new CompetitorHotelScraper(logger);

  // Scrape from each competitor
  const results = [];
  const competitors = hotel.competitors || [];

  if (competitors.length === 0) {
    logger.warn(`⚠️  Otel ${hotel.name || hotelId} için rakip bulunamadı`);
    return results;
  }

  logger.info(`🔍 ${competitors.length} rakip için scraping başlıyor...`);

  for (const competitor of competitors) {
    try {
      if (!competitor.url) {
        logger.warn(`⚠️  ${competitor.name || competitor.platform}: URL boş`);
        continue;
      }
      
      logger.info(`🌐 Scraping: ${competitor.name || competitor.platform} (${competitor.url.substring(0, 50)}...)`);
      
      let scraperResult;

      if (competitor.platform === 'booking') {
        scraperResult = await bookingScraper.scrapeHotelPrice(competitor.url || '');
      } else if (competitor.platform === 'expedia') {
        scraperResult = await expediaScraper.scrapeHotelPrice(competitor.url || '');
      } else if (competitor.platform === 'competitor') {
        // Rakip otel direkt sitesi - auto scrape
        scraperResult = await competitorScraper.scrapeCompetitorHotel(
          competitor.url || '',
          competitor.name
        );
      }

      if (scraperResult && scraperResult.price > 0) {
        // Save price to database
        const price = new Price({
          hotelId: hotel._id,
          ...scraperResult,
          scrapedAt: new Date(),
        });

        await price.save();
        
        // Update competitor's last scraped info
        await Hotel.findByIdAndUpdate(
          hotelId,
          {
            $set: {
              'competitors.$[elem].lastScrapedPrice': scraperResult.price,
              'competitors.$[elem].lastScrapedAt': new Date(),
            },
          },
          {
            arrayFilters: [{ 'elem.url': competitor.url }],
          }
        );

        logger.info(`💰 ${competitor.name || competitor.platform}: $${scraperResult.price} kaydedildi`);
        results.push(scraperResult);
      } else {
        logger.warn(`⚠️  ${competitor.name || competitor.platform}: Fiyat bulunamadı veya geçersiz`);
      }
    } catch (error) {
      logger.error(`❌ ${competitor.name || competitor.platform} scraping hatası:`, (error as Error).message);
    }
  }

  return results;
}
