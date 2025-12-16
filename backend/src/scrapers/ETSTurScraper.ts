import { BaseScraper } from './BaseScraper';
import { Logger } from 'winston';
import { HotelPrice } from './BookingScraper';
import puppeteer, { Browser } from 'puppeteer';
import * as cheerio from 'cheerio';

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
  private browser: Browser | null = null;
  private usePuppeteer: boolean = true; // Puppeteer kullanılacak mı?

  constructor(logger: Logger) {
    super(logger, {
      timeout: 30000, // ETS Tur için daha uzun timeout (Puppeteer için)
      retries: 2, // Puppeteer yavaş olabilir, retry sayısını azalt
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    });
  }

  /**
   * Puppeteer browser'ı başlat (lazy initialization)
   */
  private async getBrowser(): Promise<Browser | null> {
    if (!this.usePuppeteer) {
      return null;
    }

    try {
      if (!this.browser) {
        this.logger.info('🚀 Puppeteer browser başlatılıyor...');
        this.browser = await puppeteer.launch({
          headless: true,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--disable-gpu',
            '--window-size=1920,1080',
          ],
        });
        this.logger.info('✅ Puppeteer browser başlatıldı');
      }
      return this.browser;
    } catch (error) {
      this.logger.warn('⚠️  Puppeteer başlatılamadı, Cheerio kullanılacak:', (error as Error).message);
      this.usePuppeteer = false;
      return null;
    }
  }

  /**
   * Browser'ı kapat
   */
  async closeBrowser(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
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

      let html: string;
      let $: cheerio.CheerioAPI;

      // Önce Puppeteer ile dene (403 hatası için)
      const browser = await this.getBrowser();
      if (browser) {
        try {
          this.logger.info('🌐 Puppeteer ile sayfa yükleniyor...');
          const page = await browser.newPage();
          
          // Gerçek tarayıcı gibi görünmek için
          await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
          await page.setViewport({ width: 1920, height: 1080 });
          
          // Ekstra header'lar
          await page.setExtraHTTPHeaders({
            'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          });

          // Sayfayı yükle
          await page.goto(fullUrl, {
            waitUntil: 'networkidle2',
            timeout: 30000,
          });

          // Sayfanın yüklenmesini bekle
          await new Promise(resolve => setTimeout(resolve, 2000));

          // HTML'i al
          html = await page.content();
          await page.close();

          this.logger.info('✅ Puppeteer ile sayfa yüklendi');
        } catch (puppeteerError: any) {
          this.logger.warn(`⚠️  Puppeteer hatası, Cheerio deneniyor: ${puppeteerError.message}`);
          // Fallback: Cheerio ile dene
          try {
            html = await this.fetchPage(fullUrl);
          } catch (cheerioError) {
            throw new Error(`Both Puppeteer and Cheerio failed: ${(cheerioError as Error).message}`);
          }
        }
      } else {
        // Puppeteer yoksa Cheerio kullan
        html = await this.fetchPage(fullUrl);
      }

      $ = this.parseHTML(html);

      // ETS Tur için genişletilmiş fiyat selector'ları
      const priceSelectors = [
        // ETS Tur spesifik selector'lar
        '[data-testid*="price"]',
        '[data-testid*="Price"]',
        '.price',
        '.Price',
        '.price-value',
        '.priceValue',
        '.room-price',
        '.roomPrice',
        '.hotel-price',
        '.hotelPrice',
        '.total-price',
        '.totalPrice',
        '.final-price',
        '.finalPrice',
        '.amount',
        '.Amount',
        '.priceText',
        '.price-text',
        '[class*="price"]',
        '[class*="Price"]',
        '[class*="fiyat"]',
        '[class*="Fiyat"]',
        '[class*="amount"]',
        '[class*="Amount"]',
        '[data-price]',
        '[data-amount]',
        // Genel selector'lar
        'span[class*="price"]',
        'div[class*="price"]',
        'p[class*="price"]',
        'span[class*="Price"]',
        'div[class*="Price"]',
        'span[class*="fiyat"]',
        'div[class*="fiyat"]',
        // Meta ve data attribute'lar
        '[itemprop="price"]',
        '[itemprop="priceCurrency"]',
        'meta[property="product:price:amount"]',
        // ETS Tur room card selector'ları
        '.room-card .price',
        '.roomCard .price',
        '.room-item .price',
        '.roomItem .price',
        '.package-price',
        '.packagePrice',
      ];

      let priceText = '';
      let priceNumeric: number | null = null;
      let foundSelector = '';

      // Tüm selector'ları dene
      for (const selector of priceSelectors) {
        try {
          const elements = $(selector);
          if (elements.length > 0) {
            // Tüm eşleşen elementleri kontrol et
            for (let i = 0; i < Math.min(elements.length, 5); i++) {
              const element = $(elements[i]);
              priceText = element.text().trim();
              
              // Boş değilse ve sayı içeriyorsa
              if (priceText && priceText.length > 0 && /\d/.test(priceText)) {
                // TL, ₺ veya sayı içeriyorsa dene
                if (priceText.includes('₺') || priceText.includes('TL') || priceText.includes('TRY') || /\d{3,}/.test(priceText)) {
                  priceNumeric = this.extractPrice(priceText);
                  if (priceNumeric && priceNumeric > 100) { // Minimum 100 TL (makul bir fiyat)
                    foundSelector = selector;
                    this.logger.info(`💰 Fiyat bulundu: ${priceNumeric.toLocaleString('tr-TR')} TL (selector: ${selector}, text: "${priceText.substring(0, 50)}")`);
                    break;
                  }
                }
              }
            }
            if (priceNumeric && priceNumeric > 100) break;
          }
        } catch (e) {
          // Selector bulunamadı, devam et
          continue;
        }
      }

      // Eğer hala bulunamadıysa, tüm sayfada "TL" veya "₺" içeren elementleri ara
      if (!priceNumeric || priceNumeric === 0) {
        this.logger.warn(`⚠️  Standart selector'larla fiyat bulunamadı, genişletilmiş arama yapılıyor...`);
        
        // Tüm text içeriğinde fiyat ara
        const allText = $('body').text();
        const priceMatches = allText.match(/(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)\s*(?:TL|₺|TRY)/gi);
        
        if (priceMatches && priceMatches.length > 0) {
          // En büyük sayıyı al (genellikle toplam fiyat)
          const prices = priceMatches.map(match => {
            const cleaned = match.replace(/[^\d,]/g, '').replace(',', '.');
            return parseFloat(cleaned);
          }).filter(p => !isNaN(p) && p > 100);
          
          if (prices.length > 0) {
            priceNumeric = Math.max(...prices);
            this.logger.info(`💰 Genişletilmiş aramada fiyat bulundu: ${priceNumeric.toLocaleString('tr-TR')} TL`);
          }
        }
      }

      // Fiyat bulunamadıysa debug bilgisi
      if (!priceNumeric || priceNumeric === 0) {
        this.logger.warn(`⚠️  Fiyat bulunamadı: ${hotelName || url} (${dateRange.checkin})`);
        this.logger.debug(`🔍 URL: ${fullUrl}`);
        this.logger.debug(`🔍 HTML uzunluğu: ${html.length} karakter`);
        
        // İlk 500 karakteri logla (debug için)
        const htmlPreview = html.substring(0, 500).replace(/\s+/g, ' ');
        this.logger.debug(`🔍 HTML önizleme: ${htmlPreview}...`);
        
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

    // Browser'ı kapat (memory tasarrufu için)
    await this.closeBrowser();

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

    // Önce tüm boşlukları temizle
    let cleaned = priceString.trim().replace(/\s+/g, '');
    
    // TL, ₺, TRY işaretlerini kaldır
    cleaned = cleaned.replace(/₺/g, '').replace(/TL/gi, '').replace(/TRY/gi, '');
    
    // Türkçe format: 35.000,50 veya 35.000
    // Binlik ayırıcı nokta, ondalık ayırıcı virgül
    if (cleaned.includes(',')) {
      // Virgül varsa, ondalık ayırıcı olabilir
      const parts = cleaned.split(',');
      if (parts.length === 2) {
        // Binlik noktaları kaldır, virgülü noktaya çevir
        cleaned = parts[0].replace(/\./g, '') + '.' + parts[1];
      } else {
        // Sadece binlik ayırıcı olabilir
        cleaned = cleaned.replace(/\./g, '').replace(',', '.');
      }
    } else {
      // Nokta varsa, binlik ayırıcı olabilir
      if (cleaned.match(/\.\d{3}/)) {
        // Binlik ayırıcı: 35.000 -> 35000
        cleaned = cleaned.replace(/\./g, '');
      } else if (cleaned.match(/\.\d{1,2}$/)) {
        // Ondalık: 35000.50 -> 35000.50 (değiştirme)
      } else {
        // Tüm noktaları kaldır
        cleaned = cleaned.replace(/\./g, '');
      }
    }

    // Son temizlik: sadece sayı, nokta ve virgül kalsın
    cleaned = cleaned.replace(/[^\d.,]/g, '');
    
    // Son virgülü noktaya çevir (eğer varsa)
    cleaned = cleaned.replace(',', '.');

    // Sayıyı bul (en büyük sayıyı al - genellikle toplam fiyat)
    const matches = cleaned.match(/\d+(?:\.\d+)?/g);
    if (matches && matches.length > 0) {
      const numbers = matches.map(m => parseFloat(m)).filter(n => !isNaN(n) && n > 0);
      if (numbers.length > 0) {
        // En büyük sayıyı döndür (genellikle toplam fiyat)
        return Math.max(...numbers);
      }
    }

    // Eğer hiçbir şey bulunamadıysa, direkt parse et
    try {
      const parsed = parseFloat(cleaned);
      if (!isNaN(parsed) && parsed > 0) {
        return parsed;
      }
    } catch {
      // Parse hatası
    }

    return null;
  }
}

