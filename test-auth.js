// Test script for authentication endpoints
const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testAuthentication() {
    console.log('🧪 Testing Authentication Endpoints\n');
    console.log('='.repeat(50));

    try {
        // Test 1: Login with John
        console.log('\n1️⃣  Testing Login (John)...');
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'john@example.com',
            password: 'john123'
        });

        console.log('✅ Login successful!');
        console.log('Token:', loginResponse.data.token.substring(0, 50) + '...');
        console.log('User:', loginResponse.data.user);

        const johnToken = loginResponse.data.token;

        // Test 2: Get current user
        console.log('\n2️⃣  Testing Get Current User...');
        const meResponse = await axios.get(`${BASE_URL}/auth/me`, {
            headers: {
                'Authorization': `Bearer ${johnToken}`
            }
        });

        console.log('✅ Get current user successful!');
        console.log('User:', meResponse.data.user);

        // Test 3: Create a question with JWT
        console.log('\n3️⃣  Testing Create Question with JWT...');
        const questionResponse = await axios.post(`${BASE_URL}/questions`, {
            text: 'What is Express.js?',
            options: ['A framework', 'A database', 'A language', 'An OS'],
            keywords: ['express', 'nodejs'],
            correctAnswerIndex: 0
        }, {
            headers: {
                'Authorization': `Bearer ${johnToken}`
            }
        });

        console.log('✅ Question created successfully!');
        console.log('Question ID:', questionResponse.data.data._id);
        console.log('Author:', questionResponse.data.data.author);

        // Test 4: Login as Admin
        console.log('\n4️⃣  Testing Admin Login...');
        const adminLoginResponse = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'admin@quiz.com',
            password: 'admin123'
        });

        console.log('✅ Admin login successful!');
        console.log('Admin User:', adminLoginResponse.data.user);

        const adminToken = adminLoginResponse.data.token;

        // Test 5: Create Quiz as Admin
        console.log('\n5️⃣  Testing Create Quiz (Admin)...');
        const quizResponse = await axios.post(`${BASE_URL}/quizzes`, {
            title: 'Express.js Fundamentals',
            description: 'Test your Express.js knowledge',
            questions: []
        }, {
            headers: {
                'Authorization': `Bearer ${adminToken}`
            }
        });

        console.log('✅ Quiz created successfully!');
        console.log('Quiz ID:', quizResponse.data.data._id);
        console.log('Title:', quizResponse.data.data.title);

        // Test 6: Try to create quiz as regular user (should fail)
        console.log('\n6️⃣  Testing Create Quiz as Regular User (should fail)...');
        try {
            await axios.post(`${BASE_URL}/quizzes`, {
                title: 'Test Quiz',
                description: 'This should fail',
                questions: []
            }, {
                headers: {
                    'Authorization': `Bearer ${johnToken}`
                }
            });
            console.log('❌ ERROR: Regular user was able to create quiz!');
        } catch (error) {
            console.log('✅ Correctly rejected! Message:', error.response.data.message);
        }

        // Test 7: Register new user
        console.log('\n7️⃣  Testing User Registration...');
        const registerResponse = await axios.post(`${BASE_URL}/auth/register`, {
            username: 'testuser',
            email: 'test@example.com',
            password: 'test123'
        });

        console.log('✅ Registration successful!');
        console.log('New User:', registerResponse.data.user);
        console.log('Token received:', registerResponse.data.token ? 'Yes' : 'No');

        console.log('\n' + '='.repeat(50));
        console.log('✅ All tests passed successfully!');
        console.log('='.repeat(50));

    } catch (error) {
        console.error('\n❌ Test failed:', error.response?.data || error.message);
        process.exit(1);
    }
}

// Run tests
testAuthentication();
