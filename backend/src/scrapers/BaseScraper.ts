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

  protected async fetchPage(url: string): Promise<string> {
    const config: AxiosRequestConfig = {
      headers: {
        'User-Agent': this.userAgent,
      },
      timeout: this.timeout,
    };

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.retries; attempt++) {
      try {
        const response = await axios.get(url, config);
        return response.data;
      } catch (error) {
        lastError = error as Error;
        this.logger.warn(`Fetch attempt ${attempt}/${this.retries} failed for ${url}: ${lastError.message}`);
        
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
