const mongoose = require('mongoose');
const User = require('../models/User');

mongoose.connect('mongodb://localhost:27017/eventsnap', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  console.log('\n✅ Connected to MongoDB\n');
  
  try {
    const user = await User.findOne({ email: 'dhanushc092@gmail.com' }).select('+password');
    
    if (user) {
      console.log('✅ Admin user found!');
      console.log('ID:', user._id);
      console.log('Name:', user.name);
      console.log('Email:', user.email);
      console.log('Role:', user.role);
      console.log('Password Hash:', user.password ? 'EXISTS' : 'MISSING');
      
      // Test password
      const isValid = await user.comparePassword('Dhanush123');
      console.log('\n🔐 Password Test: "Dhanush123" ->', isValid ? '✅ VALID' : '❌ INVALID');
    } else {
      console.log('❌ Admin user NOT found with email: dhanushc092@gmail.com');
      console.log('\nChecking all users...');
      const allUsers = await User.find({});
      console.log(`Found ${allUsers.length} user(s) total:`);
      allUsers.forEach(u => {
        console.log(`  - ${u.email} (${u.name}, role: ${u.role})`);
      });
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
  
  await mongoose.connection.close();
  console.log('\n✅ Connection closed\n');
  process.exit(0);
}).catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});
