import { BaseScraper } from './BaseScraper';
import { Logger } from 'winston';
import { HotelPrice } from './BookingScraper';

export class CompetitorHotelScraper extends BaseScraper {
  constructor(logger: Logger) {
    super(logger, {
      timeout: 15000,
      retries: 3,
    });
  }

  /**
   * Rakip otel web sitesinden sadece fiyat bilgisi scrape et
   * URL'den otomatik olarak en iyi eşleşen fiyatı bul
   */
  async scrapeCompetitorHotel(url: string, hotelName?: string): Promise<HotelPrice> {
    try {
      const html = await this.fetchPage(url);
      const $ = this.parseHTML(html);

      // Ortak fiyat selector'ları deneyin (çoğu otel sitesinde çalışır)
      const priceSelectors = [
        '[data-price]',
        '[class*="price"]',
        '[class*="cost"]',
        '[class*="rate"]',
        '.price',
        '.cost',
        '.rate',
        'span[data-testid*="price"]',
        'span[class*="price"]',
      ];

      let priceText = '';
      for (const selector of priceSelectors) {
        const element = $(selector).first();
        if (element.length > 0) {
          priceText = element.text();
          if (priceText) break;
        }
      }

      // Fiyat bilgisi yok - sadece price dön
      const price = this.extractPrice(priceText);
      if (!price) {
        return {
          platform: 'competitor',
          price: 0,
          currency: 'USD',
          availability: false,
        };
      }

      // Başarıyla fiyat extract ettik
      return {
        platform: 'competitor',
        price,
        currency: 'USD',
        availability: true,
      };
    } catch (error) {
      this.logger.error(`Rakip otel scrape hatası (${hotelName || url}):`, error);
      throw error;
    }
  }

  /**
   * Belirli otel sitesi için custom selector ile sadece fiyat scrape et
   * 
   * @param url - Otel sayfasının URL'si
   * @param selectors - Custom CSS selector (sadece price)
   */
  async scrapeWithCustomSelectors(
    url: string,
    selectors: {
      priceSelector: string;
      hotelName?: string;
    }
  ): Promise<HotelPrice> {
    try {
      const html = await this.fetchPage(url);
      const $ = this.parseHTML(html);

      // Fiyat öğesini al
      const priceElement = $(selectors.priceSelector).first();
      if (!priceElement.length) {
        throw new Error(
          `Fiyat selector'ı bulunamadı: "${selectors.priceSelector}"`
        );
      }

      const priceText = priceElement.text();
      const price = this.extractPrice(priceText);

      if (!price) {
        throw new Error(`Fiyat çıkarılamadı: "${priceText}"`);
      }

      return {
        platform: 'competitor',
        price,
        currency: 'USD',
        availability: true,
      };
    } catch (error) {
      this.logger.error(
        `Custom selector scrape hatası (${selectors.hotelName || url}):`,
        error
      );
      throw error;
    }
  }

  /**
   * JSON-LD yapılandırılmış verilerinden sadece fiyat çıkar
   */
  async scrapeWithStructuredData(url: string, hotelName?: string): Promise<HotelPrice> {
    try {
      const html = await this.fetchPage(url);
      const $ = this.parseHTML(html);

      // JSON-LD schema verilerini ara
      const jsonLdScripts = $('script[type="application/ld+json"]');
      let price: number | null = null;

      for (let i = 0; i < jsonLdScripts.length; i++) {
        try {
          const jsonData = JSON.parse($(jsonLdScripts[i]).html() || '{}');

          // HotelRoom veya Accommodation schema'sından fiyat al
          if (jsonData.offers) {
            const offers = Array.isArray(jsonData.offers)
              ? jsonData.offers
              : [jsonData.offers];

            for (const offer of offers) {
              if (offer.price) {
                price = parseFloat(offer.price);
                break;
              }
            }
          }

          if (price) break;
        } catch (e) {
          // JSON parse hatası, devam et
          continue;
        }
      }

      // Meta taglardan fiyat bilgisi al
      if (!price) {
        const priceMetaTag = $('meta[property="product:price:amount"]').attr('content');
        if (priceMetaTag) {
          price = parseFloat(priceMetaTag);
        }
      }

      if (!price) {
        throw new Error('Yapılandırılmış veri kullanarak fiyat bulunamadı');
      }

      return {
        platform: 'competitor',
        price,
        currency: 'USD',
        availability: true,
      };
    } catch (error) {
      this.logger.error('Yapılandırılmış veri scrape hatası:', error);
      throw error;
    }
  }
}
