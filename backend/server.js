const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const dualAuthRoutes = require('./routes/dualAuth');
const eventRoutes = require('./routes/eventRoutes');
const photoRoutes = require('./routes/photoRoutes');

const app = express();

// ========================================
// CRITICAL: Validate FRONTEND_URL on startup
// ========================================
if (!process.env.FRONTEND_URL) {
  console.error('❌ FATAL ERROR: FRONTEND_URL environment variable is REQUIRED');
  console.error('❌ Please set FRONTEND_URL in your .env file');
  console.error('❌ Example: FRONTEND_URL=https://your-app.vercel.app');
  process.exit(1);
}

if (process.env.FRONTEND_URL.includes('localhost') && process.env.NODE_ENV === 'production') {
  console.error('❌ FATAL ERROR: FRONTEND_URL cannot use localhost in production');
  console.error('❌ Current value:', process.env.FRONTEND_URL);
  process.exit(1);
}

console.log('✅ FRONTEND_URL validated:', process.env.FRONTEND_URL);
console.log('🚀 Backend running with FRONTEND_URL:', process.env.FRONTEND_URL);

// CORS Configuration - STRICT PRODUCTION MODE
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }
    
    // STRICT whitelist: ONLY production URL + localhost for dev
    const allowedOrigins = [
      process.env.FRONTEND_URL,  // Production ONLY: https://your-app.vercel.app
      'http://localhost:3000'    // Development ONLY
    ].filter(Boolean);
    
    // Exact match ONLY - no wildcards, no regex, no fuzzy matching
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn('❌ CORS BLOCKED:', origin);
      console.warn('   Allowed origins:', allowedOrigins);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded photos
app.use('/uploads', express.static('uploads'));

// Test endpoint to verify server is receiving requests
app.post('/api/test', (req, res) => {
  console.log('🧪 Test endpoint hit - Request body:', req.body);
  res.status(200).json({ 
    success: true,
    message: 'Test endpoint working',
    receivedData: req.body
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/dual-auth', dualAuthRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/photos', photoRoutes);

// Handle preflight requests
app.options('*', cors(corsOptions));

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    message: 'EventSnap Backend is running!',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eventsnap', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected successfully');
    
    // Clean up old indexes on EventHost collection
    try {
      const EventHost = mongoose.model('EventHost');
      const db = mongoose.connection.db;
      const collection = db.collection('eventhosts');
      
      const indexes = await collection.getIndexes();
      console.log('📋 Current indexes on eventhosts:', Object.keys(indexes));
      
      // Drop problematic email unique index if it exists
      for (const indexName of Object.keys(indexes)) {
        if (indexName.includes('email') && indexName !== '_id_') {
          try {
            await collection.dropIndex(indexName);
            console.log(`🗑️ Dropped problematic index: ${indexName}`);
          } catch (dropErr) {
            console.log(`⚠️ Could not drop ${indexName}:`, dropErr.message);
          }
        }
      }
    } catch (indexErr) {
      console.log('⚠️ Index cleanup skipped:', indexErr.message);
    }
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, '0.0.0.0', () => {
    console.log('\n' + '='.repeat(60));
    console.log('🚀 EventSnap Backend Server Started');
    console.log('='.repeat(60));
    console.log(`📍 Port: ${PORT}`);
    console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL}`);
    console.log(`💾 MongoDB: ${process.env.MONGODB_URI ? 'Connected' : 'Local'}`);
    console.log(`🔒 CORS: Strict mode (production URLs only)`);
    console.log('='.repeat(60) + '\n');
  });
};

startServer();

module.exports = app;