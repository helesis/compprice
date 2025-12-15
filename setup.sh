#!/bin/bash

# CompPrice Setup Script

echo "🚀 CompPrice - Hotel Price Scraper Setup"
echo "========================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ and try again."
    exit 1
fi

echo "✅ Node.js is installed ($(node -v))"

# Check if MongoDB is installed or running
if ! command -v mongod &> /dev/null; then
    echo "⚠️  MongoDB is not installed. You can:"
    echo "   1. Install MongoDB locally: https://www.mongodb.com/try/download/community"
    echo "   2. Use MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas"
    echo ""
fi

# Setup Backend
echo ""
echo "📦 Setting up Backend..."
cd backend
npm install
cp .env.example .env
echo "✅ Backend setup complete"

# Setup Frontend
echo ""
echo "📦 Setting up Frontend..."
cd ../frontend
npm install
cp .env.example .env
echo "✅ Frontend setup complete"

echo ""
echo "🎉 Setup Complete!"
echo ""
echo "📝 Next steps:"
echo "1. Update MongoDB connection in backend/.env if needed"
echo "2. Start MongoDB: mongod"
echo "3. Start Backend: cd backend && npm run dev"
echo "4. Start Frontend: cd frontend && npm start"
echo ""
echo "🌐 Frontend will open at http://localhost:3000"
echo "⚙️  Backend API will be available at http://localhost:5000"
