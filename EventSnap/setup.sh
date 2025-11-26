#!/bin/bash

# EventSnap Setup Script
echo "🚀 Setting up EventSnap - QR-Based Event Photo Collection System"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js (v16 or higher) first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version 16 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install root dependencies
echo ""
echo "📦 Installing root dependencies..."
npm install

# Install backend dependencies
echo ""
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

# Install frontend dependencies
echo ""
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Create .env file from example
echo ""
echo "📝 Setting up environment configuration..."
if [ ! -f "backend/.env" ]; then
    cp backend/.env.example backend/.env
    echo "✅ Created backend/.env from template"
    echo "⚠️  Please update backend/.env with your actual configuration values!"
else
    echo "ℹ️  backend/.env already exists"
fi

# Setup complete
echo ""
echo "🎉 EventSnap setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Update backend/.env with your MongoDB and Cloudinary credentials"
echo "2. Start MongoDB service (if using local MongoDB)"
echo "3. Run 'npm run dev' to start both backend and frontend servers"
echo ""
echo "📚 For detailed setup instructions, see README.md"
echo ""
echo "🌐 URLs:"
echo "   Backend:  http://localhost:5000"
echo "   Frontend: http://localhost:3000"
echo ""