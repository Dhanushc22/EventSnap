@echo off
echo 🚀 Setting up EventSnap - QR-Based Event Photo Collection System
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js (v16 or higher) first.
    pause
    exit /b 1
)

echo ✅ Node.js detected
echo.

REM Install root dependencies
echo 📦 Installing root dependencies...
npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install root dependencies
    pause
    exit /b 1
)

REM Install backend dependencies
echo.
echo 📦 Installing backend dependencies...
cd backend
npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install backend dependencies
    pause
    exit /b 1
)
cd ..

REM Install frontend dependencies
echo.
echo 📦 Installing frontend dependencies...
cd frontend
npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install frontend dependencies
    pause
    exit /b 1
)
cd ..

REM Create .env file from example
echo.
echo 📝 Setting up environment configuration...
if not exist "backend\.env" (
    copy "backend\.env.example" "backend\.env" >nul
    echo ✅ Created backend\.env from template
    echo ⚠️  Please update backend\.env with your actual configuration values!
) else (
    echo ℹ️  backend\.env already exists
)

REM Setup complete
echo.
echo 🎉 EventSnap setup complete!
echo.
echo 📋 Next steps:
echo 1. Update backend\.env with your MongoDB and Cloudinary credentials
echo 2. Start MongoDB service (if using local MongoDB)
echo 3. Run 'npm run dev' to start both backend and frontend servers
echo.
echo 📚 For detailed setup instructions, see README.md
echo.
echo 🌐 URLs:
echo    Backend:  http://localhost:5000
echo    Frontend: http://localhost:3000
echo.
pause