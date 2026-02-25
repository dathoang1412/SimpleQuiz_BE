// Test registering admin user
const axios = require('axios');

async function testRegisterAdmin() {
    try {
        console.log('Testing Admin Registration...\n');

        // Register a new admin
        console.log('1. Registering new admin user...');
        const registerResponse = await axios.post('http://localhost:3000/api/auth/register', {
            username: 'superadmin',
            email: 'superadmin@quiz.com',
            password: 'super123',
            admin: true
        });

        console.log('✅ Admin registered successfully!');
        console.log('User:', registerResponse.data.user);
        console.log('Is Admin:', registerResponse.data.user.admin);
        console.log('Token:', registerResponse.data.token.substring(0, 30) + '...\n');

        const adminToken = registerResponse.data.token;

        // Test creating a quiz with the new admin
        console.log('2. Testing quiz creation with new admin...');
        const quizResponse = await axios.post('http://localhost:3000/api/quizzes', {
            title: 'Admin Test Quiz',
            description: 'Created by newly registered admin'
        }, {
            headers: {
                'Authorization': `Bearer ${adminToken}`
            }
        });

        console.log('✅ Quiz created successfully!');
        console.log('Quiz:', quizResponse.data.data);

        console.log('\n✅ All tests passed! Admin registration works correctly.');

    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

testRegisterAdmin();
