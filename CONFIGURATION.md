# CompPrice Configuration Guide

## Environment Variables

### Backend (.env)

```env
# Server Configuration
PORT=5000                                    # Server port
NODE_ENV=development                         # Environment mode

# Database
MONGODB_URI=mongodb://localhost:27017/compprice  # MongoDB connection URI

# Logging
LOG_LEVEL=info                              # Log level (debug, info, warn, error)

# Scraper Configuration
SCRAPE_INTERVAL=3600000                     # Interval in milliseconds (1 hour)
USER_AGENT=Mozilla/5.0...                  # HTTP User-Agent header

# Competitor URLs (optional, can be set per hotel in UI)
BOOKING_URL=https://www.booking.com
AIRBNB_URL=https://www.airbnb.com
EXPEDIA_URL=https://www.expedia.com
```

### Frontend (.env)

```env
# API Configuration
REACT_APP_API_URL=http://localhost:5000/api  # Backend API URL
PORT=3000                                     # Development server port
```

## MongoDB Setup

### Local Installation

1. **Mac (using Homebrew)**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

2. **Windows**
- Download from: https://www.mongodb.com/try/download/community
- Follow installation wizard
- MongoDB runs as a service

3. **Linux (Ubuntu)**
```bash
sudo apt-get update
sudo apt-get install -y mongodb
sudo systemctl start mongodb
```

### MongoDB Atlas (Cloud)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create account and cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env`:
```
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/compprice?retryWrites=true&w=majority
```

## Scraper Configuration

### Adjust Scraping Schedule

Edit `backend/src/utils/scheduler.ts` line 6:

```typescript
// Cron expression format: "minute hour day month dayOfWeek"

// Every hour at minute 0
cron.schedule('0 * * * *', async () => {

// Every 30 minutes
cron.schedule('*/30 * * * *', async () => {

// Every 15 minutes
cron.schedule('*/15 * * * *', async () => {

// Daily at 2 AM
cron.schedule('0 2 * * *', async () => {

// Every Monday at 10 AM
cron.schedule('0 10 * * 1', async () => {
```

### Timeout & Retry Configuration

Edit `backend/src/scrapers/BaseScraper.ts`:

```typescript
// Adjust timeout (milliseconds) and retry attempts
constructor(logger: Logger, options: ScraperOptions = {}) {
  super(logger, {
    timeout: 15000,      // 15 seconds
    retries: 3,          // 3 retry attempts
  });
}
```

## Adding New Competitor Platforms

### Step 1: Create Scraper Class

Create `backend/src/scrapers/MyPlatformScraper.ts`:

```typescript
import { BaseScraper } from './BaseScraper';
import { Logger } from 'winston';
import { HotelPrice } from './BookingScraper';

export class MyPlatformScraper extends BaseScraper {
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

      // Extract price using CSS selectors
      const priceText = $('.price-selector')?.first()?.text() || '';
      const price = this.extractPrice(priceText);

      if (!price) {
        throw new Error('Could not extract price');
      }

      return {
        platform: 'myplatform',
        price,
        currency: 'USD',
        availability: true,
      };
    } catch (error) {
      this.logger.error('MyPlatform scrape error:', error);
      throw error;
    }
  }
}
```

### Step 2: Update Scheduler

Edit `backend/src/utils/scheduler.ts`:

```typescript
import { MyPlatformScraper } from '../scrapers/MyPlatformScraper';

// In the scrapeHotelPrices function:
} else if (competitor.platform === 'myplatform') {
  scraperResult = await myPlatformScraper.scrapeHotelPrice(competitor.url);
}
```

### Step 3: Update Frontend

Edit `frontend/src/pages/HotelManagement.tsx`:

In the platform select dropdown:
```tsx
<option value="myplatform">MyPlatform</option>
```

## Performance Optimization

### Database Indexes
Indexes are automatically created in the Price model for:
- `hotelId` + `platform` + `createdAt`
- `createdAt`

### Query Optimization
Price queries are limited to recent data (default 30 days) to improve performance.

### Caching
For frequently accessed data, consider adding Redis:

```typescript
import redis from 'redis';

const redisClient = redis.createClient({
  host: 'localhost',
  port: 6379,
});

// Cache comparison for 5 minutes
const cacheKey = `comparison:${hotelId}`;
const cached = await redisClient.get(cacheKey);
if (cached) return JSON.parse(cached);
```

## Monitoring & Logging

### View Logs
```bash
# See live logs
tail -f backend/combined.log

# See errors only
tail -f backend/error.log

# Search logs
grep "Expedia" backend/combined.log
```

### Log Levels
- `error`: Critical errors
- `warn`: Warning messages (e.g., failed retries)
- `info`: Informational (e.g., scraping started)
- `debug`: Detailed debug information

## Security Considerations

1. **Robots.txt Compliance**
   - Check `website.com/robots.txt` before scraping
   - Respect `Crawl-delay` directives

2. **Rate Limiting**
   - Add delays between requests
   - Use proxy rotation for high volume

3. **API Protection**
   - Add authentication (JWT/OAuth) for production
   - Implement rate limiting on API endpoints
   - Add API key validation

4. **Data Privacy**
   - Store only necessary data
   - Implement data retention policies
   - Follow GDPR/CCPA compliance

## Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
mongo --eval "db.adminCommand('ping')"

# Restart MongoDB
brew services restart mongodb-community
```

### Scraper Not Working
1. Check logs: `tail -f backend/error.log`
2. Verify URL is correct
3. Check website HTML structure hasn't changed
4. Test with curl: `curl "https://website.com/hotel"`

### Frontend Not Connecting to Backend
1. Verify backend is running: `curl http://localhost:5000/health`
2. Check `REACT_APP_API_URL` in frontend/.env
3. Check CORS settings in backend/src/index.ts

## Advanced Configuration

### Email Notifications

Add nodemailer for price alerts:

```bash
npm install nodemailer
```

### Database Backups

MongoDB backup command:
```bash
mongodump --db compprice --out ./backup
mongorestore --db compprice ./backup/compprice
```

### Horizontal Scaling

For multiple scraper instances, consider:
- Redis for shared job queue
- Separate scraper microservices
- Load balancer for frontend
- Database replica set
