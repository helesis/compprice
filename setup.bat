@echo off

REM CompPrice Setup Script for Windows

echo.
echo 🚀 CompPrice - Hotel Price Scraper Setup
echo =========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed. Please install Node.js 16+ and try again.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo ✅ Node.js is installed %NODE_VERSION%
echo.

REM Setup Backend
echo 📦 Setting up Backend...
cd backend
call npm install
copy .env.example .env
cd ..
echo ✅ Backend setup complete
echo.

REM Setup Frontend
echo 📦 Setting up Frontend...
cd frontend
call npm install
copy .env.example .env
cd ..
echo ✅ Frontend setup complete
echo.

echo 🎉 Setup Complete!
echo.
echo 📝 Next steps:
echo 1. Update MongoDB connection in backend\.env if needed
echo 2. Start MongoDB: mongod
echo 3. Start Backend: cd backend ^&^& npm run dev
echo 4. Start Frontend: cd frontend ^&^& npm start
echo.
echo 🌐 Frontend will open at http://localhost:3000
echo ⚙️  Backend API will be available at http://localhost:5000
echo.
pause
