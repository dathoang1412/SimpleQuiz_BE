const express = require('express');
const router = express.Router();
const axios = require('axios');

// Đảm bảo đúng đường dẫn API gốc
const API_URL = 'http://localhost:3000/api'; 

/**
 * Hàm hỗ trợ Render EJS bên trong HBS Layout
 * @param {Object} res - Express Response object
 * @param {String} viewPath - Đường dẫn đến file EJS (ví dụ: 'questions/list.ejs')
 * @param {Object} data - Dữ liệu cần truyền vào EJS
 * @param {String} title - Tiêu đề trang (hiện trên tab trình duyệt)
 */
const renderPage = (res, viewPath, data = {}, title = 'Question Bank App') => {
    // 1. Render file EJS ra chuỗi HTML
    res.render(viewPath, data, (err, html) => {
        if (err) {
            console.error(`Lỗi render EJS [${viewPath}]:`, err);
            return res.status(500).send("Lỗi hiển thị giao diện (Render Error)");
        }
        // 2. Render layout HBS và nhét chuỗi HTML vào biến {{{body}}}
        res.render('layouts/main', {
            layout: false, // Tắt layout mặc định để tránh lặp
            body: html,    // Nội dung từ EJS
            title: title   // Tiêu đề trang
        });
    });
};

// --- QUESTION ROUTES ---

router.get('/questions', async (req, res) => {
    try {
        const response = await axios.get(`${API_URL}/questions`);
        renderPage(res, 'questions/list.ejs', { questions: response.data.data }, 'Danh sách câu hỏi');
    } catch (err) {
        renderPage(res, 'questions/list.ejs', { questions: [] }, 'Danh sách câu hỏi');
    }
});

router.get('/questions/create', (req, res) => {
    renderPage(res, 'questions/create.ejs', {}, 'Tạo câu hỏi mới');
});

router.post('/questions', async (req, res) => {
    try {
        const payload = {
            text: req.body.text,
            // Xử lý tách chuỗi option
            options: req.body.options.split(',').map(o => o.trim()).filter(o => o), 
            correctAnswerIndex: parseInt(req.body.correctAnswerIndex),
            keywords: []
        };
        await axios.post(`${API_URL}/questions`, payload);
        res.redirect('/questions');
    } catch (err) {
        console.error(err.response ? err.response.data : err.message);
        res.send(`<script>alert("Lỗi: ${err.response?.data?.message || 'Không tạo được câu hỏi'}"); window.history.back();</script>`);
    }
});

router.get('/questions/edit/:id', async (req, res) => {
    try {
        const response = await axios.get(`${API_URL}/questions/${req.params.id}`);
        renderPage(res, 'questions/edit.ejs', { question: response.data.data }, 'Sửa câu hỏi');
    } catch (err) {
        res.redirect('/questions');
    }
});

router.put('/questions/:id', async (req, res) => {
    try {
        const payload = {
            text: req.body.text,
            options: req.body.options.split(',').map(o => o.trim()).filter(o => o),
            correctAnswerIndex: parseInt(req.body.correctAnswerIndex)
        };
        await axios.put(`${API_URL}/questions/${req.params.id}`, payload);
        res.redirect('/questions');
    } catch (err) {
        res.send("Lỗi cập nhật: " + err.message);
    }
});

router.delete('/questions/:id', async (req, res) => {
    try {
        await axios.delete(`${API_URL}/questions/${req.params.id}`);
        res.redirect('/questions');
    } catch (err) {
        res.send("Lỗi xóa: " + err.message);
    }
});

// --- QUIZ ROUTES ---

router.get('/quizzes', async (req, res) => {
    try {
        const response = await axios.get(`${API_URL}/quizzes`);
        renderPage(res, 'quiz/list.ejs', { quizzes: response.data.data }, 'Danh sách Quiz');
    } catch (err) {
        renderPage(res, 'quiz/list.ejs', { quizzes: [] }, 'Danh sách Quiz');
    }
});

router.get('/quizzes/create', (req, res) => {
    renderPage(res, 'quiz/create.ejs', {}, 'Tạo Quiz mới');
});

router.post('/quizzes', async (req, res) => {
    try {
        await axios.post(`${API_URL}/quizzes`, req.body);
        res.redirect('/quizzes');
    } catch (err) {
        res.send("Lỗi tạo Quiz: " + err.message);
    }
});

router.get('/quizzes/:id', async (req, res) => {
    try {
        const response = await axios.get(`${API_URL}/quizzes/${req.params.id}`);
        renderPage(res, 'quiz/details.ejs', { quiz: response.data.data }, 'Chi tiết Quiz');
    } catch (err) {
        res.send("Lỗi tải chi tiết Quiz");
    }
});

// Route thêm câu hỏi vào Quiz
// Route thêm câu hỏi vào Quiz
router.post('/quizzes/:id/questions', async (req, res) => {
    try {
        // Dữ liệu từ form bây giờ: 
        // req.body.options = ["Đán án 1", "Đáp án 2", "Đáp án 3", "Đáp án 4"]
        // req.body.correctAnswerIndex = "0" (hoặc 1, 2, 3 tùy radio được chọn)

        const payload = {
            text: req.body.text,
            options: req.body.options, // Lấy trực tiếp mảng, không cần .split()
            correctAnswerIndex: parseInt(req.body.correctAnswerIndex),
            keywords: []
        };

        await axios.post(`${API_URL}/quizzes/${req.params.id}/question`, payload);
        res.redirect(`/quizzes/${req.params.id}`);
    } catch (err) {
        console.error(err);
        res.send(`<script>alert("Lỗi: ${err.response?.data?.message || 'Lỗi hệ thống'}"); window.history.back();</script>`);
    }
});
router.get('/quizzes/edit/:id', async (req, res) => {
    try {
        const response = await axios.get(`${API_URL}/quizzes/${req.params.id}`);
        renderPage(res, 'quiz/edit.ejs', { quiz: response.data.data }, 'Sửa Quiz');
    } catch (err) {
        res.redirect('/quizzes');
    }
});

router.put('/quizzes/:id', async (req, res) => {
    try {
        await axios.put(`${API_URL}/quizzes/${req.params.id}`, req.body);
        res.redirect('/quizzes');
    } catch (err) {
        res.send("Lỗi cập nhật Quiz");
    }
});

router.delete('/quizzes/:id', async (req, res) => {
    try {
        await axios.delete(`${API_URL}/quizzes/${req.params.id}`);
        res.redirect('/quizzes');
    } catch (err) {
        res.send("Lỗi xóa Quiz");
    }
});

module.exports = router;