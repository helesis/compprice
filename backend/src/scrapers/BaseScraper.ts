import axios, { AxiosRequestConfig } from 'axios';
import * as cheerio from 'cheerio';
import { Logger } from 'winston';

export interface ScraperOptions {
  userAgent?: string;
  timeout?: number;
  retries?: number;
}

export class BaseScraper {
  protected logger: Logger;
  protected userAgent: string;
  protected timeout: number;
  protected retries: number;

  constructor(logger: Logger, options: ScraperOptions = {}) {
    this.logger = logger;
    this.userAgent = options.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
    this.timeout = options.timeout || 10000;
    this.retries = options.retries || 3;
  }

  protected async fetchPage(url: string, additionalHeaders?: Record<string, string>): Promise<string> {
    const config: AxiosRequestConfig = {
      headers: {
        'User-Agent': this.userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Cache-Control': 'max-age=0',
        ...additionalHeaders,
      },
      timeout: this.timeout,
      maxRedirects: 5,
      validateStatus: (status) => status < 500, // 4xx hatalarını da yakala
    };

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.retries; attempt++) {
      try {
        const response = await axios.get(url, config);
        
        // 403 veya 4xx hatası kontrolü
        if (response.status === 403 || response.status === 401) {
          throw new Error(`Request failed with status code ${response.status} - Bot detection triggered`);
        }
        
        if (response.status >= 400) {
          throw new Error(`Request failed with status code ${response.status}`);
        }
        
        return response.data;
      } catch (error: any) {
        lastError = error as Error;
        const statusCode = error?.response?.status;
        const errorMsg = statusCode 
          ? `Request failed with status code ${statusCode}` 
          : lastError.message;
        
        this.logger.warn(`Fetch attempt ${attempt}/${this.retries} failed for ${url}: ${errorMsg}`);
        
        if (attempt < this.retries) {
          // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt - 1) * 1000));
        }
      }
    }

    throw lastError || new Error(`Failed to fetch ${url} after ${this.retries} retries`);
  }

  protected parseHTML(html: string) {
    return cheerio.load(html);
  }

  protected extractPrice(priceString: string): number | null {
    const match = priceString.match(/[\d,]+\.?\d*/);
    if (!match) return null;
    return parseFloat(match[0].replace(/,/g, ''));
  }
}
