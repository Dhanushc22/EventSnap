const mongoose = require('mongoose');
const Event = require('../models/Event');
const EventHost = require('../models/EventHost');
require('dotenv').config();

const createTestEvent = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eventsnap', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected');

    // Create unique event ID
    const eventId = 'evt_test_' + Date.now();
    const password = 'TestPass123';

    // Create Event
    const event = new Event({
      title: 'Test Event for Host Login',
      description: 'This is a test event for host dashboard',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      eventId: eventId,
      isActive: true
    });

    await event.save();
    console.log('✅ Event created:', event.title);

    // Create EventHost
    const eventHost = new EventHost({
      eventId: eventId,
      eventTitle: 'Test Event for Host Login',
      hostEmail: 'testhost@example.com',
      password: password
    });

    await eventHost.save();
    console.log('✅ Event Host created');

    console.log('\n🎉 Test Event Successfully Created!');
    console.log('\n📋 Host Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Event ID:', eventId);
    console.log('Password: TestPass123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\nUse these credentials at: http://localhost:3000/login');
    console.log('Select "Event Host Login" and enter the credentials above.\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

createTestEvent();
