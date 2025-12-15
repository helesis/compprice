# CompPrice - Usage Examples & Testing Guide

## 🚀 Starting the Application

### Method 1: Automated Setup
```bash
cd /Users/alimursitozkir/CompPrice

# Mac/Linux
chmod +x setup.sh
./setup.sh

# Windows
setup.bat
```

### Method 2: Manual Setup

**Terminal 1 - Backend:**
```bash
cd backend
npm install
cp .env.example .env
npm run dev
# Output: Server running on port 5000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
npm start
# Output: Compiled successfully! Open http://localhost:3000
```

**Terminal 3 - MongoDB:**
```bash
# Mac
brew services start mongodb-community

# Linux
sudo systemctl start mongodb

# Windows - Should run as service automatically
```

## 📝 Example Usage

### 1. Adding a Hotel

Go to http://localhost:3000/hotels

**Form Data:**
```json
{
  "name": "Grand Plaza Hotel",
  "address": "123 Main Street",
  "city": "New York",
  "rating": 4.5,
  "competitors": [
    {
      "platform": "booking",
      "url": "https://www.booking.com/hotel/us/grand-plaza.html"
    },
    {
      "platform": "expedia",
      "url": "https://www.expedia.com/New-York-Hotels-Grand-Plaza.html"
    }
  ]
}
```

### 2. Viewing Prices

**On Dashboard:**
- See all tracked hotels as cards
- Click any hotel to view details

**On Hotel Detail Page:**
- View current price comparison
- See 20 most recent price entries
- Select date range (7, 30, or 90 days)
- Manual scrape with "Scrape Now" button

### 3. Price Comparison

Current prices are displayed in a visual chart showing:
- Platform name
- Latest price (highlighted if cheapest)
- Price trend indicator
- Price bar visualization

## 🧪 API Testing

### Using cURL

**Get all hotels:**
```bash
curl http://localhost:5000/api/hotels
```

**Create a hotel:**
```bash
curl -X POST http://localhost:5000/api/hotels \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Hotel",
    "city": "Los Angeles",
    "rating": 4.0,
    "competitors": []
  }'
```

**Get hotel details:**
```bash
curl http://localhost:5000/api/hotels/{hotelId}
```

**Get price history (last 30 days):**
```bash
curl "http://localhost:5000/api/prices/hotel/{hotelId}?days=30"
```

**Get price comparison:**
```bash
curl http://localhost:5000/api/prices/comparison/{hotelId}
```

**Get price trends:**
```bash
curl "http://localhost:5000/api/prices/trends/{hotelId}?days=30"
```

**Trigger manual scraping:**
```bash
curl -X POST http://localhost:5000/api/scrapers/scrape/{hotelId}
```

**Get scraper status:**
```bash
curl http://localhost:5000/api/scrapers/status
```

### Using Postman

1. Create collection "CompPrice"
2. Add requests:

**GET /hotels**
```
URL: http://localhost:5000/api/hotels
Method: GET
```

**POST /hotels**
```
URL: http://localhost:5000/api/hotels
Method: POST
Body (JSON):
{
  "name": "Hotel Name",
  "address": "123 Main St",
  "city": "City Name",
  "rating": 4.5,
  "competitors": [
    {
      "platform": "booking",
      "url": "https://booking.com/..."
    }
  ]
}
```

**POST /scrapers/scrape/:id**
```
URL: http://localhost:5000/api/scrapers/scrape/{hotelId}
Method: POST
```

## 📊 Sample Data Creation

### Using API

**Create Hotel:**
```bash
curl -X POST http://localhost:5000/api/hotels \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sunset Resort",
    "address": "456 Beach Ave",
    "city": "Miami",
    "rating": 4.8,
    "competitors": [
      {
        "platform": "booking",
        "url": "https://www.booking.com/hotel/us/sunset.html"
      },
      {
        "platform": "expedia",
        "url": "https://www.expedia.com/Miami-Hotels-Sunset.html"
      }
    ]
  }'
```

**Add Price Entry:**
```bash
curl -X POST http://localhost:5000/api/prices \
  -H "Content-Type: application/json" \
  -d '{
    "hotelId": "{hotelId}",
    "platform": "booking",
    "price": 189.99,
    "currency": "USD",
    "availability": true,
    "rating": 4.2,
    "reviews": 245
  }'
```

## 🔍 Data Verification

### Check MongoDB Data

```bash
# Connect to MongoDB
mongosh

# Switch to database
use compprice

# View hotels
db.hotels.find().pretty()

# View prices
db.prices.find().pretty()

# Count prices for a hotel
db.prices.countDocuments({ hotelId: ObjectId("...") })

# Get latest prices
db.prices.find({}).sort({ createdAt: -1 }).limit(10).pretty()

# Delete test data
db.hotels.deleteMany({})
db.prices.deleteMany({})
```

## 📈 Performance Testing

### Load Testing with Apache Bench

```bash
# Install (Mac)
brew install httpd

# Get hotels (1000 requests, 10 concurrent)
ab -n 1000 -c 10 http://localhost:5000/api/hotels

# Get prices
ab -n 1000 -c 10 http://localhost:5000/api/prices/hotel/{hotelId}
```

### Memory Usage

```bash
# Check Node process memory
ps aux | grep node

# Monitor in real-time
top -p $(pgrep -f "node dist/index.js")
```

## 🐛 Debugging

### Backend Debugging

**Enable debug logging:**
```bash
# In backend/.env
LOG_LEVEL=debug
```

**Check logs:**
```bash
# Real-time log monitoring
tail -f backend/combined.log

# Error logs only
tail -f backend/error.log

# Filter by date
grep "2024-12-15" backend/combined.log
```

### Frontend Debugging

**Browser DevTools:**
1. Press F12 or right-click → Inspect
2. Console tab for errors
3. Network tab for API calls
4. React DevTools extension (recommended)

**React Console Messages:**
```bash
# In frontend/.env
REACT_APP_DEBUG=true
```

## 🧹 Cleanup

### Stop Services

```bash
# Stop backend (Ctrl+C in terminal 1)
# Stop frontend (Ctrl+C in terminal 2)

# Stop MongoDB
brew services stop mongodb-community  # Mac
sudo systemctl stop mongodb           # Linux
```

### Clear Data

```bash
# Delete all data from MongoDB
mongosh
use compprice
db.hotels.deleteMany({})
db.prices.deleteMany({})
exit
```

### Remove Node Modules

```bash
# Free up space
rm -rf backend/node_modules
rm -rf frontend/node_modules
rm -rf backend/dist
```

## 🔧 Common Issues & Solutions

### Issue: "Cannot GET /api/hotels"
**Solution:**
- Ensure backend is running on port 5000
- Check MongoDB is connected
- Verify API routes are loaded

### Issue: "localhost:3000 refused to connect"
**Solution:**
- Check frontend is running
- Verify port 3000 is available
- Clear browser cache

### Issue: "CORS error"
**Solution:**
```bash
# In backend/.env, ensure
PORT=5000

# In frontend/.env, ensure
REACT_APP_API_URL=http://localhost:5000/api
```

### Issue: "Scraper returns empty"
**Solution:**
- Verify competitor URL is correct
- Check website HTML structure
- Review backend/error.log for details
- Website may have changed selectors

## 📝 Testing Checklist

- [ ] Backend starts successfully
- [ ] Frontend starts successfully
- [ ] MongoDB connects without errors
- [ ] Can access http://localhost:3000
- [ ] Can access http://localhost:5000/health
- [ ] Can view hotels list
- [ ] Can add a new hotel
- [ ] Can view hotel details
- [ ] Can trigger manual scrape
- [ ] Price history displays
- [ ] Price comparison shows all platforms

## 🎯 Next Steps

1. Add 2-3 hotels with real competitor URLs
2. Let scraper run for at least 2 cycles
3. Observe price changes on dashboard
4. Monitor logs for errors
5. Test API endpoints with cURL/Postman
6. Deploy to Docker (optional)

## 📚 Additional Resources

- Express.js Docs: https://expressjs.com
- React Docs: https://react.dev
- MongoDB Docs: https://docs.mongodb.com
- Cheerio Docs: https://cheerio.js.org
- node-cron Docs: https://github.com/kelektiv/node-cron

---

**Happy Testing!** ✅
