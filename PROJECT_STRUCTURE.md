# CompPrice Project Summary

## 🎯 Project Overview

CompPrice is a full-stack web application that automatically scrapes competitor hotel prices from multiple booking platforms and provides a comprehensive dashboard for monitoring price changes and trends.

## 📁 Complete Project Structure

```
CompPrice/
├── README.md                          # Main documentation
├── QUICKSTART.md                      # Quick start guide
├── CONFIGURATION.md                   # Configuration reference
├── sample-data.json                   # Sample hotel data
├── setup.sh                           # Linux/Mac setup script
├── setup.bat                          # Windows setup script
├── Dockerfile                         # Main Docker image
├── docker-compose.yml                 # Docker compose configuration
├── .gitignore                         # Git ignore file
│
├── backend/                           # Express.js/Node.js Backend
│   ├── package.json                   # Dependencies
│   ├── tsconfig.json                  # TypeScript configuration
│   ├── Dockerfile                     # Backend Docker image
│   ├── .env.example                   # Environment variables template
│   ├── .gitignore                     # Backend git ignore
│   │
│   └── src/
│       ├── index.ts                   # Main server file
│       │
│       ├── models/                    # MongoDB Models
│       │   ├── Hotel.ts              # Hotel schema
│       │   └── Price.ts              # Price schema
│       │
│       ├── scrapers/                  # Web Scrapers
│       │   ├── BaseScraper.ts        # Base scraper class
│       │   ├── BookingScraper.ts     # Booking.com scraper
│       │   └── ExpediaScraper.ts     # Expedia scraper
│       │
│       ├── routes/                    # API Routes
│       │   ├── hotels.ts             # Hotel endpoints
│       │   ├── prices.ts             # Price endpoints
│       │   └── scrapers.ts           # Scraper endpoints
│       │
│       └── utils/
│           ├── logger.ts             # Winston logging
│           └── scheduler.ts          # node-cron scheduler
│
├── frontend/                          # React Frontend
│   ├── package.json                   # Dependencies
│   ├── tsconfig.json                  # TypeScript configuration
│   ├── Dockerfile                     # Frontend Docker image
│   ├── .env.example                   # Environment variables template
│   ├── .gitignore                     # Frontend git ignore
│   │
│   ├── public/
│   │   └── index.html                # HTML entry point
│   │
│   └── src/
│       ├── index.tsx                  # React entry point
│       ├── index.css                  # Global styles
│       ├── App.tsx                    # Main App component
│       ├── App.css                    # App styles
│       │
│       ├── components/                # Reusable Components
│       │   ├── Navigation.tsx         # Navigation bar
│       │   ├── Navigation.css
│       │   ├── PriceChart.tsx         # Price comparison chart
│       │   └── PriceChart.css
│       │
│       ├── pages/                     # Page Components
│       │   ├── Dashboard.tsx          # Main dashboard
│       │   ├── Dashboard.css
│       │   ├── HotelDetail.tsx        # Hotel detail page
│       │   ├── HotelDetail.css
│       │   ├── HotelManagement.tsx    # Hotel management page
│       │   └── HotelManagement.css
│       │
│       ├── hooks/                     # Custom React Hooks
│       │   └── useData.ts             # Data fetching hook
│       │
│       └── utils/
│           ├── api.ts                 # Axios API client
│           └── helpers.ts             # Utility functions
```

## 🚀 Key Features

### Backend Features
- ✅ **RESTful API** with Express.js
- ✅ **MongoDB** integration with Mongoose
- ✅ **Web Scraping** using Axios + Cheerio
- ✅ **Scheduled Tasks** with node-cron (hourly by default)
- ✅ **Error Handling** and Logging with Winston
- ✅ **Retry Logic** with exponential backoff
- ✅ **CORS** enabled for frontend communication

### Frontend Features
- ✅ **Modern React UI** with React Router
- ✅ **Dashboard** showing all tracked hotels
- ✅ **Price Comparison** charts and visualizations
- ✅ **Price History** with date filters
- ✅ **Hotel Management** (add, edit, delete)
- ✅ **Responsive Design** for all devices
- ✅ **Real-time Updates** with manual scrape triggers

### Database Schema
- **Hotels Collection**: Hotel details, ratings, competitor URLs
- **Prices Collection**: Price history with timestamps and platform info
- **Indexes**: Optimized queries for price lookups

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Node.js, Express.js, TypeScript |
| **Frontend** | React 18, TypeScript, CSS3 |
| **Database** | MongoDB |
| **Scraping** | Axios, Cheerio |
| **Scheduling** | node-cron |
| **Logging** | Winston |
| **HTTP** | Axios |
| **Containerization** | Docker, Docker Compose |

## 📊 API Endpoints

### Hotels
```
GET    /api/hotels                    # List all hotels
GET    /api/hotels/:id                # Get hotel details
POST   /api/hotels                    # Create hotel
PUT    /api/hotels/:id                # Update hotel
DELETE /api/hotels/:id                # Delete hotel
```

### Prices
```
GET    /api/prices/hotel/:hotelId                # Price history
GET    /api/prices/comparison/:hotelId           # Current comparison
GET    /api/prices/trends/:hotelId?days=30      # Price trends
POST   /api/prices                               # Record price
```

### Scrapers
```
POST   /api/scrapers/scrape/:hotelId  # Trigger manual scrape
GET    /api/scrapers/status            # Scraper status
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- MongoDB (local or Atlas)
- npm or yarn

### Setup (Automated)
```bash
# Mac/Linux
chmod +x setup.sh
./setup.sh

# Windows
setup.bat
```

### Setup (Manual)
```bash
# Backend
cd backend
npm install
cp .env.example .env
npm run dev

# Frontend (in new terminal)
cd frontend
npm install
npm start
```

## 📝 Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/compprice
NODE_ENV=development
LOG_LEVEL=info
SCRAPE_INTERVAL=3600000
USER_AGENT=Mozilla/5.0...
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000/api
```

## 🔄 Scraping Schedule

Default: **Every hour** (configurable in `backend/src/utils/scheduler.ts`)

```typescript
// Change frequency
cron.schedule('*/30 * * * *'); // Every 30 minutes
cron.schedule('0 0 * * *');    // Daily at midnight
```

## 🔌 Adding New Platforms

1. Create scraper in `backend/src/scrapers/NewPlatform.ts`
2. Update scheduler in `backend/src/utils/scheduler.ts`
3. Add to frontend form in `frontend/src/pages/HotelManagement.tsx`

## 📦 Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up --build

# Service ports
# - Frontend: http://localhost:3000
# - Backend: http://localhost:5000
# - MongoDB: localhost:27017
```

## 🧪 Testing

```bash
# Backend tests (prepare jest config)
cd backend && npm test

# Frontend tests
cd frontend && npm test
```

## 📚 Documentation Files

- **README.md** - Full documentation and features
- **QUICKSTART.md** - Get started in 5 minutes
- **CONFIGURATION.md** - Detailed configuration guide
- **This file** - Project structure overview

## 🎓 Learning Resources

The codebase includes:
- TypeScript best practices
- React hooks and functional components
- MongoDB schema design
- RESTful API patterns
- Web scraping techniques
- Error handling and logging
- Docker containerization
- Async/await patterns

## 🔐 Security Notes

- Always check `robots.txt` before scraping
- Respect rate limits and add delays
- Use User-Agent headers
- Implement proper error handling
- Use HTTPS in production
- Add authentication for API endpoints

## 🐛 Troubleshooting

### MongoDB Connection Failed
```bash
# Start MongoDB
brew services start mongodb-community  # Mac
mongod                                  # Linux
```

### Port Already in Use
```bash
# Backend port 5000
lsof -i :5000
kill -9 <PID>

# Frontend port 3000
lsof -i :3000
kill -9 <PID>
```

### CORS Errors
- Verify backend is running on port 5000
- Check REACT_APP_API_URL in frontend/.env
- Restart frontend server

## 📈 Performance Tips

1. **Optimize Queries**: Use date filters to limit data
2. **Add Indexes**: Already included for hotelId, platform, createdAt
3. **Cache Data**: Consider Redis for frequently accessed comparisons
4. **Rate Limiting**: Add delays between scraper requests
5. **Pagination**: Implement for large datasets

## 🎯 Next Steps

1. ✅ Install dependencies
2. ✅ Start MongoDB
3. ✅ Run backend (`npm run dev`)
4. ✅ Run frontend (`npm start`)
5. ✅ Add hotels in management page
6. ✅ Set competitor URLs
7. ✅ View prices on dashboard
8. ✅ Scraper runs automatically every hour

## 📞 Support

For issues or questions:
1. Check CONFIGURATION.md
2. Review backend logs: `backend/error.log`
3. Check browser console for frontend errors
4. Verify MongoDB is running

## 📄 License

MIT License - Feel free to use and modify this project

---

**Happy Price Tracking!** 🎉
