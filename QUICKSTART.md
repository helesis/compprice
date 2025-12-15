# CompPrice - Quick Start Guide

## Installation & Running

### 1. Backend Setup
```bash
cd backend
npm install
npm run dev
```
Server runs on http://localhost:5001

### 2. Frontend Setup
```bash
cd frontend
npm install
npm start
```
App opens on http://localhost:3000

### 3. MongoDB Setup

**⭐ RECOMMENDED: MongoDB Atlas (Cloud - Free)**

1. Go to https://www.mongodb.com/cloud/atlas
2. Click "Try Free" and create account
3. Create a free M0 cluster
4. Click "Connect" → "Drivers" → Copy connection string
5. Replace `<db_password>` with your database password
6. Update `backend/.env`:
```
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?appName=Cluster0
```
7. Run backend with `npm run dev`

**Example (Already configured):**
```
MONGODB_URI=mongodb+srv://mursitozkir_db_user:<db_password>@cluster0.g17wlvi.mongodb.net/?appName=Cluster0
```
Just replace `<db_password>` with your actual password!

## Main Features

### Dashboard (`/`)
- View all tracked hotels
- See hotel ratings and locations
- Quick access to detailed price analysis

### Hotel Management (`/hotels`)
- Add new hotels to track
- Set up competitor URLs (Booking.com, Expedia, etc.)
- Manage hotel details
- Delete tracked hotels

### Hotel Details (`/hotels/:id`)
- View current price comparison across platforms
- See price history over time
- Filter by date range (7, 30, 90 days)
- Manual scrape trigger
- Detailed price table with ratings

## API Quick Reference

```bash
# Get all hotels
curl http://localhost:5001/api/hotels

# Get prices for a hotel
curl http://localhost:5001/api/prices/hotel/{hotelId}?days=30

# Get price comparison
curl http://localhost:5001/api/prices/comparison/{hotelId}

# Trigger manual scraping
curl -X POST http://localhost:5001/api/scrapers/scrape/{hotelId}
```

## Customization

### Change Scraping Schedule
Edit `backend/src/utils/scheduler.ts` line 6:
- `'0 * * * *'` = every hour (current)
- `'*/30 * * * *'` = every 30 minutes
- `'0 0 * * *'` = daily at midnight

### Add New Competitor Platforms
1. Create scraper in `backend/src/scrapers/`
2. Implement `scrapeHotelPrice()` method
3. Add to scheduler in `backend/src/utils/scheduler.ts`
4. Add option in frontend form

## Logs
- Backend logs: `backend/error.log` and `backend/combined.log`
- Frontend: Browser console (F12)

## Next Steps
1. Add some hotels on the Hotels page
2. Set competitor URLs (get from booking.com, expedia, etc.)
3. View Dashboard for overview
4. Click hotels for detailed analytics
5. Prices will be updated automatically every hour
