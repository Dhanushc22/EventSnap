const axios = require('axios');

async function testSignup() {
    try {
        const response = await axios.post('http://localhost:5000/api/auth/signup', {
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123'
        });
        
        console.log('✅ Signup successful!');
        console.log('Response:', response.data);
    } catch (error) {
        console.log('❌ Signup failed!');
        console.log('Error:', error.response?.data || error.message);
    }
}

testSignup();