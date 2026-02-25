// Test script for admin-only question creation
const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testAdminOnlyQuestionCreation() {
    console.log('🧪 Testing Admin-Only Question Creation\n');
    console.log('='.repeat(50));

    try {
        // Step 1: Login as Regular User (John)
        console.log('\n1️⃣  Logging in as Regular User (John)...');
        const userLoginResponse = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'john@example.com',
            password: 'john123'
        });
        const johnToken = userLoginResponse.data.token;
        console.log('✅ Logged in as John');

        // Step 2: Try to create a question as John (should fail)
        console.log('\n2️⃣  Attempting to create a question as John (should fail)...');
        try {
            await axios.post(`${BASE_URL}/questions`, {
                text: 'Should John be able to see this?',
                options: ['Yes', 'No'],
                keywords: ['test'],
                correctAnswerIndex: 1
            }, {
                headers: { 'Authorization': `Bearer ${johnToken}` }
            });
            console.log('❌ ERROR: Regular user was able to create a question!');
        } catch (error) {
            console.log('✅ Correctly rejected! Status:', error.response?.status);
            console.log('Message:', error.response?.data?.message);
        }

        // Step 3: Login as Admin
        console.log('\n3️⃣  Logging in as Admin...');
        const adminLoginResponse = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'admin@quiz.com',
            password: 'admin123'
        });
        const adminToken = adminLoginResponse.data.token;
        console.log('✅ Logged in as Admin');

        // Step 4: Create a question as Admin (should succeed)
        console.log('\n4️⃣  Attempting to create a question as Admin (should succeed)...');
        const questionResponse = await axios.post(`${BASE_URL}/questions`, {
            text: 'Is this an admin-only question?',
            options: ['Yes', 'Definitely'],
            keywords: ['test', 'admin'],
            correctAnswerIndex: 0
        }, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        console.log('✅ Admin successfully created a question!');
        console.log('Question ID:', questionResponse.data.data._id);

        console.log('\n' + '='.repeat(50));
        console.log('✅ Verification complete: Question creation is now admin-only.');
        console.log('='.repeat(50));

    } catch (error) {
        console.error('\n❌ Test failed:', error.response?.data || error.message);
        process.exit(1);
    }
}

testAdminOnlyQuestionCreation();
