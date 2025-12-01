#!/bin/bash
# Render.com Deployment Script
# This script contains the exact commands for deploying to Render

echo "🚀 EventSnap Backend Deployment to Render"
echo "=========================================="

# Build command for Render
npm install --production

# Start command for Render  
echo "✅ Dependencies installed"
echo "🌐 Starting server..."
node server.js