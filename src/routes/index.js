const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const Quiz = require('../models/Quiz');

/**
 * Hàm hỗ trợ Render EJS bên trong HBS Layout
 */
const renderPage = (res, viewPath, data = {}, title = 'Question Bank App') => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.render(viewPath, data, (err, html) => {
        if (err) {
            console.error(`Lỗi render EJS [${viewPath}]:`, err);
            return res.status(500).send("Lỗi hiển thị giao diện (Render Error)");
        }
        res.render('layouts/main', {
            layout: false,
            body: html,
            title: title
        });
    });
};

// --- QUESTION ROUTES ---

router.get('/questions', async (req, res) => {
    try {
        const questions = await Question.find().sort({ createdAt: -1 });
        renderPage(res, 'questions/list.ejs', { questions }, 'Danh sách câu hỏi');
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
            options: req.body.options.split(',').map(o => o.trim()).filter(o => o),
            correctAnswerIndex: parseInt(req.body.correctAnswerIndex),
            keywords: [],
            // Mặc định gán author là ID của admin đầu tiên hoặc placeholder nếu chưa có
            author: req.body.author || null
        };
        await Question.create(payload);
        res.redirect('/questions');
    } catch (err) {
        console.error(err);
        res.send(`<script>alert("Lỗi: ${err.message || 'Không tạo được câu hỏi'}"); window.history.back();</script>`);
    }
});

router.get('/questions/edit/:id', async (req, res) => {
    try {
        const question = await Question.findById(req.params.id);
        if (!question) return res.redirect('/questions');
        renderPage(res, 'questions/edit.ejs', { question }, 'Sửa câu hỏi');
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
        await Question.findByIdAndUpdate(req.params.id, payload);
        res.redirect('/questions');
    } catch (err) {
        res.send("Lỗi cập nhật: " + err.message);
    }
});

router.delete('/questions/:id', async (req, res) => {
    try {
        await Question.findByIdAndDelete(req.params.id);
        res.redirect('/questions');
    } catch (err) {
        res.send("Lỗi xóa: " + err.message);
    }
});

// --- QUIZ ROUTES ---

router.get('/quizzes', async (req, res) => {
    try {
        const quizzes = await Quiz.find().sort({ createdAt: -1 });
        renderPage(res, 'quiz/list.ejs', { quizzes }, 'Danh sách Quiz');
    } catch (err) {
        renderPage(res, 'quiz/list.ejs', { quizzes: [] }, 'Danh sách Quiz');
    }
});

router.get('/quizzes/create', (req, res) => {
    renderPage(res, 'quiz/create.ejs', {}, 'Tạo Quiz mới');
});

router.post('/quizzes', async (req, res) => {
    try {
        await Quiz.create(req.body);
        res.redirect('/quizzes');
    } catch (err) {
        res.send("Lỗi tạo Quiz: " + err.message);
    }
});

router.get('/quizzes/:id', async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id).populate('questions');
        if (!quiz) return res.send("Không tìm thấy Quiz");
        renderPage(res, 'quiz/details.ejs', { quiz }, 'Chi tiết Quiz');
    } catch (err) {
        res.send("Lỗi tải chi tiết Quiz");
    }
});

router.post('/quizzes/:id/questions', async (req, res) => {
    try {
        const payload = {
            text: req.body.text,
            options: req.body.options,
            correctAnswerIndex: parseInt(req.body.correctAnswerIndex),
            keywords: []
        };

        const question = await Question.create(payload);
        await Quiz.findByIdAndUpdate(req.params.id, {
            $push: { questions: question._id }
        });

        res.redirect(`/quizzes/${req.params.id}`);
    } catch (err) {
        console.error(err);
        res.send(`<script>alert("Lỗi: ${err.message || 'Lỗi hệ thống'}"); window.history.back();</script>`);
    }
});

router.get('/quizzes/edit/:id', async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);
        if (!quiz) return res.redirect('/quizzes');
        renderPage(res, 'quiz/edit.ejs', { quiz }, 'Sửa Quiz');
    } catch (err) {
        res.redirect('/quizzes');
    }
});

router.put('/quizzes/:id', async (req, res) => {
    try {
        await Quiz.findByIdAndUpdate(req.params.id, req.body);
        res.redirect('/quizzes');
    } catch (err) {
        res.send("Lỗi cập nhật Quiz");
    }
});

router.delete('/quizzes/:id', async (req, res) => {
    try {
        await Quiz.findByIdAndDelete(req.params.id);
        res.redirect('/quizzes');
    } catch (err) {
        res.send("Lỗi xóa Quiz");
    }
});

module.exports = router;
