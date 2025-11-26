const mongoose = require('mongoose');
const User = require('./backend/models/User');
require('dotenv').config({ path: './backend/.env' });

async function createUser() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Check if user already exists
        const existingUser = await User.findOne({ email: 'dhanushc092@gmail.com' });
        if (existingUser) {
            console.log('👤 User already exists:', existingUser.email);
            return;
        }

        // Create the user
        const user = new User({
            name: 'Dhanush',
            email: 'dhanushc092@gmail.com',
            password: 'Dhanush123'
        });

        await user.save();
        console.log('✅ User created successfully!');
        console.log('📧 Email:', user.email);
        console.log('👤 Name:', user.name);
        console.log('🆔 User ID:', user._id);

    } catch (error) {
        console.error('❌ Error creating user:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('👋 Database connection closed');
    }
}

createUser();