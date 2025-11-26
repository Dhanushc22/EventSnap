const mongoose = require('mongoose');
const Photo = require('./models/Photo');

mongoose.connect('mongodb://localhost:27017/eventsnap').then(async () => {
  try {
    // Update all pending photos to approved
    const result = await Photo.updateMany(
      { status: 'pending' },
      { status: 'approved' }
    );
    
    console.log(`✅ Updated ${result.modifiedCount} photos from pending to approved`);
    
    // Show all photos
    const allPhotos = await Photo.find().select('photoURL status uploadedByName eventId');
    console.log('All photos:', allPhotos);
    
  } catch(e) {
    console.error('Error:', e.message);
  } finally {
    process.exit(0);
  }
});