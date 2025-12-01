const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');

const seedAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eventsnap', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'dhanushc092@gmail.com' });
    
    if (existingAdmin) {
      console.log('ℹ️ Admin user already exists');
      // Update password
      existingAdmin.password = 'Dhanush123';
      existingAdmin.role = 'admin';
      existingAdmin.name = 'Admin';
      await existingAdmin.save();
      console.log('✅ Admin password updated');
    } else {
      // Create new admin user
      const adminUser = new User({
        name: 'Admin',
        email: 'dhanushc092@gmail.com',
        password: 'Dhanush123',
        role: 'admin',
        isActive: true
      });

      await adminUser.save();
      console.log('✅ Admin user created successfully');
      console.log('📧 Email: dhanushc092@gmail.com');
      console.log('🔑 Password: Dhanush123');
    }

    // Close connection
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

seedAdmin();
