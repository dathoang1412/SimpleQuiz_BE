require('dotenv').config();
const mongoose = require('mongoose');
const Quiz = require('./src/models/Quiz');
const Question = require('./src/models/Question');
const User = require('./src/models/User');

// Kết nối database
async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/SimpleQuiz');
        console.log('✓ Kết nối database thành công');
    } catch (error) {
        console.error('✗ Lỗi kết nối database:', error);
        process.exit(1);
    }
}

// Dữ liệu seed
const seedData = async () => {
    try {
        // Xóa dữ liệu cũ
        await Quiz.deleteMany({});
        await Question.deleteMany({});
        await User.deleteMany({});
        console.log('✓ Xóa dữ liệu cũ thành công');

        // Tạo users (1 admin và 2 regular users)
        const users = await User.create([
            {
                username: 'admin',
                email: 'admin@quiz.com',
                password: 'admin123',
                admin: true
            },
            {
                username: 'john_doe',
                email: 'john@example.com',
                password: 'john123',
                admin: false
            },
            {
                username: 'jane_smith',
                email: 'jane@example.com',
                password: 'jane123',
                admin: false
            }
        ]);

        console.log('✓ Tạo thành công 3 users (1 admin, 2 regular users)');
        console.log('\nUser IDs for testing:');
        users.forEach(user => {
            console.log(`- ${user.username} (${user.admin ? 'ADMIN' : 'USER'})`);
            console.log(`  ID: ${user._id}`);
            console.log(`  Email: ${user.email}`);
        });

        console.log('\n🔑 Login Credentials:');
        console.log('- Admin: admin@quiz.com / admin123');
        console.log('- John: john@example.com / john123');
        console.log('- Jane: jane@example.com / jane123');

        const [adminUser, johnUser, janeUser] = users;

        // Tạo các câu hỏi cho Quiz 1: JavaScript Basics
        const jsQuestions = await Question.create([
            {
                text: 'JavaScript là ngôn ngữ gì?',
                options: ['Ngôn ngữ lập trình', 'Ngôn ngữ markup', 'Ngôn ngữ style', 'Cơ sở dữ liệu'],
                keywords: ['JavaScript', 'lập trình'],
                correctAnswerIndex: 0,
                author: johnUser._id
            },
            {
                text: 'Từ khóa nào dùng để khai báo biến trong JavaScript hiện đại?',
                options: ['var', 'let', 'const', 'Tất cả đều đúng'],
                keywords: ['biến', 'khai báo', 'let', 'const'],
                correctAnswerIndex: 3,
                author: johnUser._id
            },
            {
                text: 'Hàm anonymous trong JavaScript là gì?',
                options: ['Hàm không có tên', 'Hàm có tên riêng', 'Hàm được import', 'Hàm toàn cục'],
                keywords: ['hàm', 'anonymous'],
                correctAnswerIndex: 0,
                author: janeUser._id
            }
        ]);

        // Tạo các câu hỏi cho Quiz 2: HTML & CSS
        const htmlCssQuestions = await Question.create([
            {
                text: 'HTML là viết tắt của?',
                options: ['Hyper Text Markup Language', 'High Technology Modern Language', 'Home Tool Markup Language', 'Hyperlinks and Text Markup Language'],
                keywords: ['HTML', 'markup'],
                correctAnswerIndex: 0,
                author: janeUser._id
            },
            {
                text: 'CSS dùng để làm gì?',
                options: ['Tạo cấu trúc trang web', 'Tạo phong cách cho trang web', 'Tạo chức năng tương tác', 'Quản lý cơ sở dữ liệu'],
                keywords: ['CSS', 'phong cách', 'style'],
                correctAnswerIndex: 1,
                author: janeUser._id
            },
            {
                text: 'Selector nào chọn tất cả các phần tử?',
                options: ['.class', '#id', '*', 'element'],
                keywords: ['CSS', 'selector'],
                correctAnswerIndex: 2,
                author: johnUser._id
            },
            {
                text: 'Tag nào dùng để tạo tiêu đề lớn nhất?',
                options: ['<h6>', '<h1>', '<header>', '<title>'],
                keywords: ['HTML', 'heading', 'h1'],
                correctAnswerIndex: 1,
                author: johnUser._id
            }
        ]);

        // Tạo các câu hỏi cho Quiz 3: Lập trình cơ bản
        const basicProgQuestions = await Question.create([
            {
                text: 'Vòng lặp nào thực hiện ít nhất một lần?',
                options: ['for loop', 'while loop', 'do-while loop', 'forEach'],
                keywords: ['vòng lặp', 'do-while'],
                correctAnswerIndex: 2,
                author: johnUser._id
            },
            {
                text: 'Array trong JavaScript bắt đầu từ chỉ số nào?',
                options: ['1', '0', '-1', 'a'],
                keywords: ['array', 'index', 'chỉ số'],
                correctAnswerIndex: 1,
                author: janeUser._id
            }
        ]);

        // Tạo Quiz
        const quizzes = await Quiz.create([
            {
                title: 'JavaScript Basics',
                description: 'Kiểm tra kiến thức cơ bản về JavaScript, bao gồm các biến, hàm và cú pháp cơ bản',
                questions: jsQuestions.map(q => q._id)
            },
            {
                title: 'HTML & CSS Fundamentals',
                description: 'Test kiến thức về HTML markup và CSS styling để xây dựng giao diện web',
                questions: htmlCssQuestions.map(q => q._id)
            },
            {
                title: 'Lập trình Cơ bản',
                description: 'Các câu hỏi về vòng lặp, mảng và các cấu trúc dữ liệu cơ bản',
                questions: basicProgQuestions.map(q => q._id)
            }
        ]);

        console.log(`\n✓ Tạo thành công ${quizzes.length} Quiz với ${jsQuestions.length + htmlCssQuestions.length + basicProgQuestions.length} câu hỏi`);
        console.log('\nDữ liệu seed:');
        quizzes.forEach(quiz => {
            console.log(`- ${quiz.title} (${quiz.questions.length} câu hỏi)`);
        });

        console.log('\n📝 Hướng dẫn test API:');
        console.log('Sử dụng User IDs ở trên để test authentication:');
        console.log(`- Admin operations: Sử dụng x-user-id: ${adminUser._id}`);
        console.log(`- Regular user operations: Sử dụng x-user-id: ${johnUser._id} hoặc ${janeUser._id}`);

        process.exit(0);
    } catch (error) {
        console.error('✗ Lỗi khi tạo seed data:', error);
        process.exit(1);
    }
};

// Chạy seed
connectDB().then(() => seedData());
