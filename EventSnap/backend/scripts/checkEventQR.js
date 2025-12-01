require('dotenv').config();
const mongoose = require('mongoose');
const Event = require('../models/Event');

const checkEventQR = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eventsnap');
    console.log('✅ Connected to MongoDB');

    const events = await Event.find({}).sort({ createdAt: -1 }).limit(5);
    
    console.log(`\n📋 Found ${events.length} recent events:\n`);
    
    events.forEach((event, index) => {
      console.log(`Event ${index + 1}:`);
      console.log(`  Title: ${event.title}`);
      console.log(`  Event ID: ${event.eventId}`);
      console.log(`  QR Code URL exists: ${!!event.qrCodeURL}`);
      console.log(`  QR Code URL length: ${event.qrCodeURL ? event.qrCodeURL.length : 0}`);
      console.log(`  QR Code URL starts with: ${event.qrCodeURL ? event.qrCodeURL.substring(0, 50) + '...' : 'N/A'}`);
      console.log(`  Upload URL: ${event.uploadURL}`);
      console.log(`  Gallery URL: ${event.galleryURL}`);
      console.log('');
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkEventQR();
