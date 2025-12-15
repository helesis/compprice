import { BaseScraper } from './BaseScraper';
import { Logger } from 'winston';
import { HotelPrice } from './BookingScraper';

export class ExpediaScraper extends BaseScraper {
  constructor(logger: Logger) {
    super(logger, {
      timeout: 15000,
      retries: 3,
    });
  }

  async scrapeHotelPrice(hotelUrl: string): Promise<HotelPrice> {
    try {
      const html = await this.fetchPage(hotelUrl);
      const $ = this.parseHTML(html);

      // Example selectors - adjust based on actual Expedia structure
      const priceText = $('.uitax')?.first()?.text() || '';
      const rating = parseFloat($('.ui-rating')?.text() || '0');

      const price = this.extractPrice(priceText);

      if (!price) {
        throw new Error('Could not extract price from Expedia');
      }

      return {
        platform: 'expedia',
        price,
        currency: 'USD',
        availability: true,
        rating: rating || undefined,
      };
    } catch (error) {
      this.logger.error('Expedia scrape error:', error);
      throw error;
    }
  }
}
