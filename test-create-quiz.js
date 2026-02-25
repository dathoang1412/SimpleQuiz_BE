// Quick test for create quiz endpoint
const axios = require('axios');

async function testCreateQuiz() {
    try {
        // First login as admin
        console.log('1. Logging in as admin...');
        const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
            email: 'admin@quiz.com',
            password: 'admin123'
        });

        const adminToken = loginResponse.data.token;
        console.log('✅ Login successful');
        console.log('Token:', adminToken.substring(0, 30) + '...\n');

        // Test create quiz
        console.log('2. Creating quiz...');
        const quizResponse = await axios.post('http://localhost:3000/api/quizzes', {
            title: 'Test Quiz',
            description: 'This is a test quiz'
        }, {
            headers: {
                'Authorization': `Bearer ${adminToken}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('✅ Quiz created successfully!');
        console.log('Response:', JSON.stringify(quizResponse.data, null, 2));

    } catch (error) {
        console.error('❌ Error occurred:');
        console.error('Status:', error.response?.status);
        console.error('Data:', error.response?.data);
        console.error('Headers:', error.response?.headers);

        if (error.response?.headers['content-type']?.includes('text/html')) {
            console.error('\n⚠️  Server returned HTML instead of JSON!');
            console.error('First 200 chars:', error.response.data.substring(0, 200));
        }
    }
}

testCreateQuiz();
