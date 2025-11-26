const mongoose = require('mongoose');
const User = require('./models/User');
const Event = require('./models/Event');

async function testDatabase() {
    try {
        // Connect to MongoDB
        await mongoose.connect('mongodb://localhost:27017/eventsnap');
        console.log('✅ Connected to MongoDB');
        
        // Get database info
        console.log('📊 Database:', mongoose.connection.db.databaseName);
        
        // List all collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('📁 Collections:', collections.map(c => c.name));
        
        // Test User model
        console.log('\n🧪 Testing User model...');
        const userCount = await User.countDocuments();
        console.log('👥 User count:', userCount);
        
        // Test Event model
        console.log('\n🧪 Testing Event model...');
        const eventCount = await Event.countDocuments();
        console.log('🎪 Event count:', eventCount);
        
        // Show indexes
        console.log('\n📈 User indexes:', await User.collection.getIndexes());
        console.log('📈 Event indexes:', await Event.collection.getIndexes());
        
        console.log('\n✅ Database test completed successfully!');
        
    } catch (error) {
        console.error('❌ Database test failed:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('👋 Database connection closed');
    }
}

testDatabase();