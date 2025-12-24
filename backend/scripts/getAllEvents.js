const mongoose = require('mongoose');
const Event = require('../models/Event');
const EventHost = require('../models/EventHost');
const Photo = require('../models/Photo');

mongoose.connect('mongodb://localhost:27017/eventsnap', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  console.log('\n✅ Connected to MongoDB\n');
  console.log('='.repeat(70));
  console.log('                    ALL EVENTS IN DATABASE');
  console.log('='.repeat(70));

  try {
    const events = await Event.find({}).populate('createdBy', 'name email');
    const hosts = await EventHost.find({});
    
    if (events.length === 0) {
      console.log('\n⚠️  No events found in database\n');
    } else {
      console.log(`\n📊 Found ${events.length} event(s):\n`);
      
      for (const event of events) {
        const host = hosts.find(h => h.eventId === event.eventId);
        const photoCount = await Photo.countDocuments({ eventId: event._id });
        const approvedCount = await Photo.countDocuments({ eventId: event._id, status: 'approved' });
        
        console.log('╔════════════════════════════════════════════════════════════════╗');
        console.log('║ EVENT DETAILS                                                  ║');
        console.log('╠════════════════════════════════════════════════════════════════╣');
        console.log(`║ Title:         ${event.title.padEnd(48)} ║`);
        console.log(`║ Event ID:      ${event.eventId.padEnd(48)} ║`);
        console.log(`║ Password:      ${host ? 'TestPass123 (default)'.padEnd(48) : 'N/A'.padEnd(48)} ║`);
        console.log('╠════════════════════════════════════════════════════════════════╣');
        console.log(`║ Description:   ${(event.description || 'N/A').substring(0, 48).padEnd(48)} ║`);
        console.log(`║ Event Date:    ${new Date(event.date).toLocaleDateString().padEnd(48)} ║`);
        console.log(`║ Created On:    ${new Date(event.createdAt).toLocaleString().padEnd(48)} ║`);
        console.log(`║ Status:        ${(event.isActive ? '✅ Active' : '❌ Inactive').padEnd(48)} ║`);
        console.log('╠════════════════════════════════════════════════════════════════╣');
        console.log(`║ Created By:    ${(event.createdBy ? `${event.createdBy.name} (${event.createdBy.email})` : 'Public Event').substring(0, 48).padEnd(48)} ║`);
        console.log(`║ Host Email:    ${(host?.hostEmail || 'N/A').padEnd(48)} ║`);
        console.log(`║ Last Login:    ${(host?.lastLogin ? new Date(host.lastLogin).toLocaleString() : 'Never').padEnd(48)} ║`);
        console.log('╠════════════════════════════════════════════════════════════════╣');
        console.log(`║ Total Photos:  ${String(photoCount).padEnd(48)} ║`);
        console.log(`║ Approved:      ${String(approvedCount).padEnd(48)} ║`);
        console.log(`║ Pending:       ${String(photoCount - approvedCount).padEnd(48)} ║`);
        console.log('╠════════════════════════════════════════════════════════════════╣');
        console.log(`║ Upload URL:    ${(event.uploadURL || 'N/A').substring(0, 48).padEnd(48)} ║`);
        console.log(`║ Gallery URL:   ${(event.galleryURL || 'N/A').substring(0, 48).padEnd(48)} ║`);
        console.log(`║ QR Code:       ${(event.qrCodeURL ? '✅ Generated' : '❌ Not generated').padEnd(48)} ║`);
        console.log('╚════════════════════════════════════════════════════════════════╝');
        console.log('');
      }

      console.log('\n' + '='.repeat(70));
      console.log('                    QUICK COPY - LOGIN CREDENTIALS');
      console.log('='.repeat(70) + '\n');
      
      for (const event of events) {
        const host = hosts.find(h => h.eventId === event.eventId);
        console.log(`📌 ${event.title}`);
        console.log(`   Event ID: ${event.eventId}`);
        console.log(`   Password: ${host ? 'TestPass123' : 'N/A'}`);
        console.log(`   Host Email: ${host?.hostEmail || 'N/A'}`);
        console.log('');
      }
    }

    console.log('='.repeat(70));
    console.log('💡 Use these credentials at: http://localhost:3000/login');
    console.log('   Select "Event Host Login" tab and enter Event ID + Password');
    console.log('='.repeat(70));
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
