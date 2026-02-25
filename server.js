const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./src/config/database');
const path = require('path');
const methodOverride = require('method-override');
// QUAN TRỌNG: Import thư viện handlebars
const { engine } = require('express-handlebars');

dotenv.config();
connectDB();

const questionApiRoutes = require('./src/routes/questionRoutes');
const quizApiRoutes = require('./src/routes/quizRoutes');
const userApiRoutes = require('./src/routes/userRoutes');
const authApiRoutes = require('./src/routes/authRoutes');
const uiRoutes = require('./src/routes/index');

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));

// Custom Request Logger
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        const status = res.statusCode;
        const method = req.method;
        const color = status >= 500 ? '\x1b[31m' : status >= 400 ? '\x1b[33m' : status >= 300 ? '\x1b[36m' : '\x1b[32m';
        const reset = '\x1b[0m';
        const type = method === 'OPTIONS' ? '[Preflight]' : '[Request]';
        console.log(`${type} [${new Date().toLocaleTimeString()}] ${method} ${req.originalUrl} ${color}${status}${reset} - ${duration}ms`);
    });
    next();
});

app.use(express.static(path.join(__dirname, 'public')));

// --- CẤU HÌNH VIEW ENGINE (Bắt buộc) ---

// 1. Cấu hình Handlebars (HBS)
app.engine('hbs', engine({
    extname: '.hbs',
    defaultLayout: 'main', // File chính là main.hbs
    layoutsDir: path.join(__dirname, 'views/layouts'),
    partialsDir: path.join(__dirname, 'views/partials')
}));

// 2. Cấu hình EJS
app.engine('ejs', require('ejs').__express);

// 3. Chọn view engine mặc định là hbs
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5175', 'https://simple-quiz-fe.vercel.app'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true
}));

// Routes
app.use('/api/auth', authApiRoutes);
app.use('/api/questions', questionApiRoutes);
app.use('/api/quizzes', quizApiRoutes);
app.use('/api/users', userApiRoutes);
app.use('/', uiRoutes);

// Global error handling middleware (must be last)
app.use((err, req, res, next) => {
    // Log error for debugging
    console.error('Error:', err);

    // Default error status and message
    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';

    // Send JSON response for API routes
    if (req.path.startsWith('/api')) {
        return res.status(status).json({
            success: false,
            message: message,
            error: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }

    // Send HTML error page for UI routes
    res.status(status).send(`
        <h1>Error ${status}</h1>
        <p>${message}</p>
    `);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/questions`);
});