import { BaseScraper } from './BaseScraper';
import { Logger } from 'winston';

export interface HotelPrice {
  platform: string;
  price: number;
  currency: string;
  roomType?: string;
  availability: boolean;
  rating?: number;
  reviews?: number;
  checkin?: string; // DD.MM.YYYY format for date-based scraping
  checkout?: string; // DD.MM.YYYY format for date-based scraping
}

export class BookingScraper extends BaseScraper {
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

      // Example selectors - adjust based on actual Booking.com structure
      const priceText = $('.hprt-price-price')?.first()?.text() || '';
      const rating = parseFloat($('.review-score-badge')?.text() || '0');
      const reviews = parseInt($('.review-score-review-count')?.text() || '0');

      const price = this.extractPrice(priceText);

      if (!price) {
        throw new Error('Could not extract price from Booking.com');
      }

      return {
        platform: 'booking',
        price,
        currency: 'USD',
        availability: true,
        rating: rating || undefined,
        reviews: reviews || undefined,
      };
    } catch (error) {
      this.logger.error('Booking.com scrape error:', error);
      throw error;
    }
  }
}
