# CompPrice - Command Reference

## 🚀 Project Setup

### Initial Setup
```bash
# Navigate to project
cd /Users/alimursitozkir/CompPrice

# Automated setup (recommended)
chmod +x setup.sh
./setup.sh

# Manual setup - Backend
cd backend
npm install
cp .env.example .env
npm run dev

# Manual setup - Frontend (new terminal)
cd frontend
npm install
npm start
```

## 📦 Backend Commands

### Development
```bash
# Start development server (with auto-reload)
npm run dev

# Build TypeScript to JavaScript
npm run build

# Start production build
npm start

# Run tests (if configured)
npm test
```

### Dependencies
```bash
# Install dependencies
npm install

# Update dependencies
npm update

# Add new package
npm install package-name

# Remove package
npm uninstall package-name
```

### Database
```bash
# Connect to MongoDB
mongosh

# MongoDB commands
use compprice                           # Switch database
db.hotels.find()                        # View all hotels
db.prices.find()                        # View all prices
db.hotels.countDocuments()              # Count hotels
db.prices.countDocuments()              # Count prices
db.hotels.deleteMany({})                # Clear hotels
db.prices.deleteMany({})                # Clear prices
```

### Logging
```bash
# View combined logs
tail -f error.log
tail -f combined.log

# Search logs
grep "error" error.log
grep "Expedia" combined.log

# Clear logs
rm error.log
rm combined.log

# Stream logs (newer tail)
tail --follow combined.log
```

## 🎨 Frontend Commands

### Development
```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Eject configuration (⚠️ irreversible)
npm run eject
```

### Dependencies
```bash
# Install dependencies
npm install

# Update dependencies
npm update

# Add new package
npm install package-name

# Remove package
npm uninstall package-name
```

## 🐳 Docker Commands

### Build & Run
```bash
# Build images
docker-compose build

# Run containers
docker-compose up

# Run in background
docker-compose up -d

# Stop containers
docker-compose down

# View logs
docker-compose logs

# View specific service logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs mongodb
```

### Image Management
```bash
# List images
docker images

# Remove image
docker rmi image-name

# Build specific service
docker-compose build backend
docker-compose build frontend
```

### Container Management
```bash
# List running containers
docker ps

# List all containers
docker ps -a

# Stop container
docker stop container-id

# Start container
docker start container-id

# Remove container
docker rm container-id

# View container logs
docker logs container-id

# Access container shell
docker exec -it container-id /bin/sh
```

## 🧪 Testing & Verification

### API Endpoints
```bash
# Health check
curl http://localhost:5000/health

# Get all hotels
curl http://localhost:5000/api/hotels

# Get specific hotel
curl http://localhost:5000/api/hotels/{hotelId}

# Get prices
curl http://localhost:5000/api/prices/hotel/{hotelId}

# Get comparison
curl http://localhost:5000/api/prices/comparison/{hotelId}

# Trigger scraping
curl -X POST http://localhost:5000/api/scrapers/scrape/{hotelId}

# Get scraper status
curl http://localhost:5000/api/scrapers/status
```

### Create Sample Data
```bash
# Create hotel
curl -X POST http://localhost:5000/api/hotels \
  -H "Content-Type: application/json" \
  -d '{"name":"Hotel","city":"City","rating":4.5,"competitors":[]}'

# Create price entry
curl -X POST http://localhost:5000/api/prices \
  -H "Content-Type: application/json" \
  -d '{"hotelId":"{id}","platform":"booking","price":100,"currency":"USD","availability":true}'

# Update hotel
curl -X PUT http://localhost:5000/api/hotels/{hotelId} \
  -H "Content-Type: application/json" \
  -d '{"name":"New Name","rating":4.8}'

# Delete hotel
curl -X DELETE http://localhost:5000/api/hotels/{hotelId}
```

## 📊 Database Commands

### MongoDB CLI
```bash
# Start MongoDB shell
mongosh

# Show databases
show databases

# Switch to database
use compprice

# Show collections
show collections

# Count documents
db.hotels.countDocuments()
db.prices.countDocuments()

# Find all documents
db.hotels.find()
db.prices.find()

# Find with filters
db.prices.find({ platform: "booking" })
db.hotels.find({ city: "New York" })

# Find with limit
db.prices.find().limit(10)

# Find and sort
db.prices.find().sort({ createdAt: -1 })

# Update document
db.hotels.updateOne(
  { _id: ObjectId("...") },
  { $set: { name: "New Name" } }
)

# Delete document
db.hotels.deleteOne({ _id: ObjectId("...") })

# Delete all
db.hotels.deleteMany({})

# Create index
db.prices.createIndex({ hotelId: 1, createdAt: -1 })

# View indexes
db.prices.getIndexes()

# Export collection
mongoexport --db compprice --collection hotels --out hotels.json

# Import collection
mongoimport --db compprice --collection hotels --file hotels.json

# Exit
exit
```

## 🔍 Process Management

### Check Running Processes
```bash
# List Node processes
ps aux | grep node

# List on specific port
lsof -i :5000
lsof -i :3000
lsof -i :27017

# Kill process by PID
kill -9 PID

# Kill by port
lsof -i :5000 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

### System Monitoring
```bash
# Real-time process monitor
top

# Memory usage
ps aux | head -n 20

# Disk usage
df -h

# MongoDB disk usage
du -sh /var/lib/mongodb

# Network connections
netstat -an
```

## 📝 File Operations

### Project Files
```bash
# View file structure
tree -I 'node_modules|dist'

# List files
ls -la

# Find files
find . -name "*.ts" -type f

# File count
find . -name "*.ts" -type f | wc -l

# Search content
grep -r "searchTerm" --include="*.ts"

# Show file
cat filename
head filename
tail filename
```

### Directory Operations
```bash
# Navigate directories
cd backend
cd ../frontend
cd ../..

# Create directory
mkdir new-folder

# Remove directory
rm -rf folder

# Copy directory
cp -r source destination

# Move/rename
mv old-name new-name
```

## 🧹 Cleanup Commands

### Clear Node Modules
```bash
# Backend
cd backend
rm -rf node_modules
npm install

# Frontend
cd ../frontend
rm -rf node_modules
npm install
```

### Clear Build Artifacts
```bash
# Backend
cd backend
rm -rf dist

# Frontend
cd ../frontend
rm -rf build
```

### Clear Logs
```bash
cd backend
rm -f error.log
rm -f combined.log
```

### Clear Cache
```bash
# npm cache
npm cache clean --force

# Node cache
rm -rf ~/.npm
```

## 🔧 Development Utilities

### TypeScript
```bash
# Type check (backend)
cd backend
npx tsc --noEmit

# Watch mode
npx tsc --watch
```

### Linting
```bash
# Install ESLint
npm install eslint

# Initialize
npx eslint --init

# Check files
npx eslint src/
```

### Code Formatting
```bash
# Install Prettier
npm install prettier

# Format files
npx prettier --write src/
```

## 📈 Performance Commands

### Build Analysis
```bash
# Backend build size
du -sh backend/dist

# Frontend build size
du -sh frontend/build
```

### Load Testing
```bash
# Apache Bench (Mac)
brew install httpd

# Test endpoint
ab -n 1000 -c 10 http://localhost:5000/api/hotels

# Test with concurrent requests
ab -n 5000 -c 50 http://localhost:5000/api/prices/hotel/{hotelId}
```

## 🔐 Environment Management

### Environment Variables
```bash
# View environment variables
env

# Set temporary variable
export VAR_NAME=value

# Create .env file
cp .env.example .env

# Edit .env
nano .env
vim .env

# Source .env (not auto-loaded in Node)
source .env
```

## 🚀 Deployment Commands

### Build for Production
```bash
# Backend
cd backend
npm run build

# Frontend
cd ../frontend
npm run build
```

### Docker Deployment
```bash
# Build and start
docker-compose up --build

# Stop
docker-compose down

# Remove volumes
docker-compose down -v

# Logs
docker-compose logs -f
```

## 📱 Git Commands

### Version Control
```bash
# Initialize repository
git init

# Clone repository
git clone url

# Check status
git status

# Add files
git add .

# Commit
git commit -m "message"

# Push
git push origin main

# Pull
git pull origin main

# View logs
git log

# Create branch
git checkout -b branch-name

# Switch branch
git checkout branch-name

# Merge
git merge branch-name

# Remove file from git
git rm --cached filename
```

## 🎯 Useful Aliases

Add to ~/.zshrc or ~/.bashrc:

```bash
# Navigation
alias cpback="cd /Users/alimursitozkir/CompPrice/backend"
alias cpfront="cd /Users/alimursitozkir/CompPrice/frontend"
alias cproot="cd /Users/alimursitozkir/CompPrice"

# Commands
alias devback="cpback && npm run dev"
alias devfront="cpfront && npm start"
alias startmongo="brew services start mongodb-community"
alias stopmongo="brew services stop mongodb-community"
```

Usage:
```bash
alias devall="(cd backend && npm run dev) & (cd frontend && npm start)"
devall  # Starts both services
```

---

## Quick Reference Table

| Task | Command |
|------|---------|
| Install deps (backend) | `cd backend && npm install` |
| Install deps (frontend) | `cd frontend && npm install` |
| Start backend | `cd backend && npm run dev` |
| Start frontend | `cd frontend && npm start` |
| Start MongoDB | `brew services start mongodb-community` |
| Stop MongoDB | `brew services stop mongodb-community` |
| Connect to MongoDB | `mongosh` |
| View all hotels | `curl http://localhost:5000/api/hotels` |
| Docker up | `docker-compose up` |
| Docker down | `docker-compose down` |
| Build TypeScript | `cd backend && npm run build` |
| Build React | `cd frontend && npm run build` |
| View logs | `tail -f backend/combined.log` |
| Clear data | `mongosh → use compprice → db.hotels.deleteMany({})` |
| Kill port 5000 | `lsof -i :5000 \| grep LISTEN \| awk '{print $2}' \| xargs kill -9` |

---

**Keep this file bookmarked for quick reference!** 🔖
