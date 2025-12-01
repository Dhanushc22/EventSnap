const mongoose = require('mongoose');
const EventHost = require('../models/EventHost');
const Event = require('../models/Event');

mongoose.connect('mongodb://localhost:27017/eventsnap', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  console.log('\n✅ Connected to MongoDB\n');
  console.log('='.repeat(60));
  console.log('           EVENT LOGIN CREDENTIALS');
  console.log('='.repeat(60));

  try {
    const hosts = await EventHost.find().select('eventId hostEmail createdAt');
    const events = await Event.find().select('eventId title eventDate');

    if (hosts.length === 0) {
      console.log('\n⚠️  No events found in database\n');
    } else {
      console.log(`\nFound ${hosts.length} event(s):\n`);
      
      for (const host of hosts) {
        const event = events.find(e => e.eventId === host.eventId);
        
        console.log('╔═══════════════════════════════════════════════════════╗');
        console.log('║ Event ID:     ', host.eventId.padEnd(37), '║');
        console.log('║ Password:      TestPass123                            ║');
        console.log('║ Title:        ', (event ? event.title : 'N/A').padEnd(37), '║');
        console.log('║ Host Email:   ', host.hostEmail.padEnd(37), '║');
        console.log('║ Created:      ', new Date(host.createdAt).toLocaleDateString().padEnd(37), '║');
        console.log('╚═══════════════════════════════════════════════════════╝');
        console.log('');
      }

      console.log('\n📋 QUICK COPY FORMAT:\n');
      for (const host of hosts) {
        console.log(`Event ID: ${host.eventId}`);
        console.log(`Password: TestPass123`);
        console.log('');
      }
    }

    console.log('='.repeat(60));
    console.log('💡 TIP: Use these credentials at http://localhost:3000/login');
    console.log('='.repeat(60));
    console.log('');

  } catch (error) {
    console.error('❌ Error fetching events:', error);
  }

  await mongoose.connection.close();
  console.log('✅ Connection closed\n');
  process.exit(0);
}).catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});
