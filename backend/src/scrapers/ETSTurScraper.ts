import { BaseScraper } from './BaseScraper';
import { Logger } from 'winston';
import { HotelPrice } from './BookingScraper';

export interface DateRange {
  checkin: string; // DD.MM.YYYY format
  checkout: string; // DD.MM.YYYY format
  nights?: number;
}

export interface SeasonScrapeOptions {
  year: number; // 2026
  startDate: Date;
  endDate: Date;
  nights: number; // 7 gece
  intervalDays?: number; // Haftalık = 7, günlük = 1
}

export class ETSTurScraper extends BaseScraper {
  constructor(logger: Logger) {
    super(logger, {
      timeout: 20000, // ETS Tur için daha uzun timeout
      retries: 3,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    });
  }

  /**
   * ETS Tur'dan belirli tarih aralığı için fiyat çek
   * @param url - Otel URL'si (base URL, tarih parametreleri eklenecek)
   * @param dateRange - Check-in ve check-out tarihleri
   */
  async scrapeHotelPrice(
    url: string,
    dateRange: DateRange,
    hotelName?: string
  ): Promise<HotelPrice> {
    try {
      // URL'den base URL'i al (query parametreleri varsa temizle)
      const baseUrl = url.split('?')[0];
      
      // ETS Tur URL formatı: ?giris=DD.MM.YYYY&cikis=DD.MM.YYYY&yetiskin=2&cocuk=0
      const params = new URLSearchParams({
        giris: dateRange.checkin,
        cikis: dateRange.checkout,
        yetiskin: '2',
        cocuk: '0',
      });

      const fullUrl = `${baseUrl}?${params.toString()}`;
      
      this.logger.info(`🌐 ETS Tur scraping: ${hotelName || url} (${dateRange.checkin} - ${dateRange.checkout})`);

      const html = await this.fetchPage(fullUrl);
      const $ = this.parseHTML(html);

      // ETS Tur için fiyat selector'ları (güncellenebilir)
      const priceSelectors = [
        '.price-value',
        '.room-price',
        '[class*="price"]',
        '.hotel-price',
        '[data-price]',
        '.priceText',
        '.amount',
        '[class*="Price"]',
        '[class*="fiyat"]',
        '.price-amount',
        '.total-price',
        '.final-price',
        'span[class*="price"]',
        'div[class*="price"]',
      ];

      let priceText = '';
      let priceNumeric: number | null = null;

      // Tüm selector'ları dene
      for (const selector of priceSelectors) {
        try {
          const element = $(selector).first();
          if (element.length > 0) {
            priceText = element.text().trim();
            
            // TL veya ₺ içeriyorsa sayısal değeri çıkar
            if (priceText && (priceText.includes('₺') || priceText.includes('TL') || /\d/.test(priceText))) {
              priceNumeric = this.extractPrice(priceText);
              if (priceNumeric && priceNumeric > 0) {
                this.logger.info(`💰 Fiyat bulundu: ${priceNumeric} TL (selector: ${selector})`);
                break;
              }
            }
          }
        } catch (e) {
          // Selector bulunamadı, devam et
          continue;
        }
      }

      // Fiyat bulunamadıysa
      if (!priceNumeric || priceNumeric === 0) {
        this.logger.warn(`⚠️  Fiyat bulunamadı: ${hotelName || url} (${dateRange.checkin})`);
        return {
          platform: 'etstur',
          price: 0,
          currency: 'TRY',
          availability: false,
          checkin: dateRange.checkin,
          checkout: dateRange.checkout,
        };
      }

      return {
        platform: 'etstur',
        price: priceNumeric,
        currency: 'TRY',
        availability: true,
        checkin: dateRange.checkin,
        checkout: dateRange.checkout,
      };
    } catch (error) {
      this.logger.error(`❌ ETS Tur scraping hatası (${hotelName || url}):`, error);
      throw error;
    }
  }

  /**
   * 2026 sezonu için haftalık fiyatları çek
   * @param url - Otel URL'si
   * @param options - Sezon ayarları
   */
  async scrapeSeason(
    url: string,
    options: SeasonScrapeOptions,
    hotelName?: string
  ): Promise<HotelPrice[]> {
    const results: HotelPrice[] = [];
    const intervalDays = options.intervalDays || 7; // Varsayılan haftalık
    
    let currentDate = new Date(options.startDate);
    const endDate = new Date(options.endDate);

    this.logger.info(`🗓️  Sezon scraping başlıyor: ${hotelName || url}`);
    this.logger.info(`📅 Tarih aralığı: ${currentDate.toLocaleDateString('tr-TR')} - ${endDate.toLocaleDateString('tr-TR')}`);
    this.logger.info(`🌙 Konaklama: ${options.nights} gece`);
    this.logger.info(`📊 Interval: Her ${intervalDays} günde bir`);

    let weekCount = 0;
    const totalWeeks = Math.ceil((endDate.getTime() - currentDate.getTime()) / (intervalDays * 24 * 60 * 60 * 1000));

    while (currentDate <= endDate) {
      weekCount++;
      
      // Checkout tarihini hesapla
      const checkoutDate = new Date(currentDate);
      checkoutDate.setDate(checkoutDate.getDate() + options.nights);

      // Yıl kontrolü (2026 içinde mi?)
      if (checkoutDate.getFullYear() > options.year) {
        break;
      }

      const dateRange: DateRange = {
        checkin: this.formatDateTR(currentDate),
        checkout: this.formatDateTR(checkoutDate),
        nights: options.nights,
      };

      try {
        this.logger.info(`[${weekCount}/${totalWeeks}] Hafta ${weekCount} (${dateRange.checkin}) ... `);
        
        const result = await this.scrapeHotelPrice(url, dateRange, hotelName);
        results.push(result);

        if (result.price > 0) {
          this.logger.info(`✅ ${result.price.toLocaleString('tr-TR')} ₺`);
        } else {
          this.logger.warn(`❌ Müsaitlik yok`);
        }

        // Rate limiting - her 10 sorguda bir uzun ara
        if (weekCount % 10 === 0) {
          this.logger.info(`💤 10 sorgu tamamlandı, 10 saniye bekleniyor...`);
          await new Promise(resolve => setTimeout(resolve, 10000));
        } else {
          // Normal bekleme
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      } catch (error) {
        this.logger.error(`⚠️  Hafta ${weekCount} hatası:`, (error as Error).message);
        // Hata olsa bile devam et
        results.push({
          platform: 'etstur',
          price: 0,
          currency: 'TRY',
          availability: false,
          checkin: dateRange.checkin,
          checkout: dateRange.checkout,
        });
      }

      // Bir sonraki tarihe geç
      currentDate.setDate(currentDate.getDate() + intervalDays);
    }

    const successCount = results.filter(r => r.price > 0).length;
    this.logger.info(`✅ Sezon scraping tamamlandı: ${successCount}/${results.length} başarılı`);

    return results;
  }

  /**
   * Tarihi Türkçe formatına çevir (DD.MM.YYYY)
   */
  private formatDateTR(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  }

  /**
   * Fiyat metninden sayısal değeri çıkar (TL/₺ desteği ile)
   */
  protected extractPrice(priceString: string): number | null {
    if (!priceString) return null;

    // TL ve ₺ işaretlerini temizle
    let cleaned = priceString
      .replace(/₺/g, '')
      .replace(/TL/g, '')
      .replace(/TRY/g, '')
      .replace(/\s/g, '')
      .replace(/\./g, '') // Binlik ayırıcı noktaları kaldır
      .replace(/,/g, '.'); // Ondalık ayırıcı virgülü noktaya çevir

    // Sayıyı bul
    const match = cleaned.match(/\d+(?:\.\d+)?/);
    if (match) {
      try {
        return parseFloat(match[0]);
      } catch {
        return null;
      }
    }
    return null;
  }
}

