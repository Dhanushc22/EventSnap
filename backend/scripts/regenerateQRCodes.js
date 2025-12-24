require('dotenv').config();
const mongoose = require('mongoose');
const Event = require('../models/Event');
const { generateQRCode } = require('../utils/qrGenerator');

const regenerateAllQRCodes = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eventsnap');
    console.log('✅ Connected to MongoDB');

    const events = await Event.find({});
    console.log(`\n📋 Found ${events.length} events to update\n`);

    for (const event of events) {
      console.log(`Processing: ${event.title} (${event.eventId})`);
      
      // Generate QR code
      const qrResult = await generateQRCode(event.eventId, {
        format: 'base64',
        width: 300
      });

      if (qrResult.success) {
        event.qrCodeURL = qrResult.qrCode;
        event.uploadURL = qrResult.uploadURL;
        
        // Add gallery URL
        if (!process.env.FRONTEND_URL) {
          throw new Error('FRONTEND_URL environment variable is required');
        }
        event.galleryURL = `${process.env.FRONTEND_URL}/gallery/${event.eventId}`;
        
        await event.save();
        console.log(`✅ Updated QR code for: ${event.title}`);
        console.log(`   Upload URL: ${event.uploadURL}`);
        console.log(`   Gallery URL: ${event.galleryURL}`);
      } else {
        console.log(`❌ Failed to generate QR for: ${event.title}`);
      }
      console.log('');
    }

    console.log('✅ All events updated!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

regenerateAllQRCodes();
