# CompPrice - Hotel Price Competitor Dashboard

A web scraper and dashboard application that automatically monitors competitor hotel prices and displays price trends and comparisons.

## Features

✅ **Automated Price Scraping** - Schedules regular scraping from multiple hotel booking platforms
✅ **Real-time Dashboard** - Visual display of current prices and trends
✅ **Price Comparison** - Compare prices across multiple competitors for the same hotel
✅ **Price History** - Track price changes over time with detailed historical data
✅ **Hotel Management** - Add, update, and manage tracked hotels and their competitors
✅ **API Backend** - RESTful API for all operations
✅ **Responsive UI** - Modern, user-friendly dashboard interface

## Tech Stack

### Backend
- **Framework**: Express.js (Node.js)
- **Language**: TypeScript
- **Database**: MongoDB
- **Scraping**: Axios + Cheerio
- **Scheduling**: node-cron
- **Logging**: Winston

### Frontend
- **Framework**: React 18
- **Language**: TypeScript
- **Styling**: CSS3
- **HTTP Client**: Axios
- **Routing**: React Router v6
- **Charts**: Recharts (optional, for advanced visualizations)

## Project Structure

```
CompPrice/
├── backend/
│   ├── src/
│   │   ├── index.ts              # Main server file
│   │   ├── models/
│   │   │   ├── Hotel.ts          # Hotel data model
│   │   │   └── Price.ts          # Price data model
│   │   ├── scrapers/
│   │   │   ├── BaseScraper.ts    # Base scraper class
│   │   │   ├── BookingScraper.ts # Booking.com scraper
│   │   │   └── ExpediaScraper.ts # Expedia scraper
│   │   ├── routes/
│   │   │   ├── hotels.ts         # Hotel endpoints
│   │   │   ├── prices.ts         # Price endpoints
│   │   │   └── scrapers.ts       # Scraper endpoints
│   │   └── utils/
│   │       ├── logger.ts         # Logging setup
│   │       └── scheduler.ts      # Job scheduling
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navigation.tsx
│   │   │   └── PriceChart.tsx
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── HotelDetail.tsx
│   │   │   └── HotelManagement.tsx
│   │   ├── App.tsx
│   │   └── index.tsx
│   ├── public/
│   │   └── index.html
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 16+ 
- MongoDB (local or cloud)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

4. Update `.env` with your configuration:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/compprice
NODE_ENV=development
SCRAPE_INTERVAL=3600000
```

5. Start the server:
```bash
npm run dev
```

The backend will be available at `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```bash
cp .env.example .env
```

4. Start the development server:
```bash
npm start
```

The frontend will be available at `http://localhost:3000`

## API Endpoints

### Hotels
- `GET /api/hotels` - Get all tracked hotels
- `GET /api/hotels/:id` - Get specific hotel
- `POST /api/hotels` - Create new hotel
- `PUT /api/hotels/:id` - Update hotel
- `DELETE /api/hotels/:id` - Delete hotel

### Prices
- `GET /api/prices/hotel/:hotelId` - Get price history for hotel
- `GET /api/prices/comparison/:hotelId` - Get price comparison (latest)
- `GET /api/prices/trends/:hotelId` - Get price trends
- `POST /api/prices` - Record manual price entry

### Scrapers
- `POST /api/scrapers/scrape/:hotelId` - Manually trigger scraping
- `GET /api/scrapers/status` - Get scraper status

## Usage

1. **Add a Hotel**: Go to Hotels management page and add a hotel with competitor URLs
2. **View Dashboard**: See all tracked hotels on the main dashboard
3. **Monitor Prices**: Click on a hotel to see detailed price history and comparisons
4. **Automatic Scraping**: The system automatically scrapes prices hourly (configurable)
5. **Manual Scraping**: Use the "Scrape Now" button for immediate updates

## Configuration

### Scraping Frequency
Edit the cron expression in `backend/src/utils/scheduler.ts`:
```typescript
// Currently runs every hour (0 * * * *)
cron.schedule('0 * * * *', async () => {
  // ...
});
```

### Supported Platforms
- Booking.com
- Expedia
- Airbnb (framework ready)
- Agoda (framework ready)
- Hotels.com (framework ready)

## Adding New Scrapers

1. Create a new scraper class in `backend/src/scrapers/`:
```typescript
import { BaseScraper } from './BaseScraper';

export class NewPlatformScraper extends BaseScraper {
  async scrapeHotelPrice(url: string): Promise<HotelPrice> {
    // Implementation
  }
}
```

2. Update the scheduler to use the new scraper:
```typescript
if (competitor.platform === 'newplatform') {
  scraperResult = await newPlatformScraper.scrapeHotelPrice(competitor.url);
}
```

## Important Notes

- **Legal Compliance**: Always check the terms of service of each website before scraping
- **Rate Limiting**: Implement proper delays and respect robots.txt
- **User Agent**: The scraper includes a user agent header to identify requests
- **Error Handling**: Failed scrapes don't stop the scheduler; errors are logged

## Development

### Build Backend
```bash
cd backend
npm run build
```

### Build Frontend
```bash
cd frontend
npm run build
```

### Testing
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## Troubleshooting

**MongoDB Connection Error**
- Ensure MongoDB is running: `mongod`
- Check MONGODB_URI in .env

**CORS Errors**
- Update frontend API_URL to match backend PORT
- Check CORS settings in backend/src/index.ts

**Scraping Failures**
- Check logs in `backend/error.log`
- Verify competitor URLs are correct
- Check if websites have changed their HTML structure

## Future Enhancements

- [ ] Advanced chart visualizations with Recharts
- [ ] Email/SMS alerts for price drops
- [ ] Price prediction using ML
- [ ] Multi-user support with authentication
- [ ] Database backups and exports
- [ ] API rate limiting and authentication
- [ ] Support for more booking platforms
- [ ] Mobile app

## License

MIT

## Support

For issues and questions, please open an issue in the repository.
