const Quiz = require('../models/Quiz');
const Question = require('../models/Question');

// @desc    Create a new quiz
// @route   POST /api/quizzes
// @access  Public
const createQuiz = async (req, res) => {
    try {
        const { title, description, questions } = req.body;

        const quiz = await Quiz.create({
            title,
            description,
            questions: questions || []
        });

        res.status(201).json({
            success: true,
            data: quiz
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get all quizzes with populated questions
// @route   GET /api/quizzes
// @access  Public
const getQuizzes = async (req, res) => {
    try {
        const quizzes = await Quiz.find().populate('questions');

        res.status(200).json({
            success: true,
            count: quizzes.length,
            data: quizzes
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get single quiz with populated questions
// @route   GET /api/quizzes/:id
// @access  Public
const getQuizById = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id).populate('questions');

        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: 'Quiz not found'
            });
        }

        res.status(200).json({
            success: true,
            data: quiz
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update quiz
// @route   PUT /api/quizzes/:id
// @access  Public
const updateQuiz = async (req, res) => {
    try {
        const { title, description, questions } = req.body;

        const quiz = await Quiz.findByIdAndUpdate(
            req.params.id,
            { title, description, questions },
            { new: true, runValidators: true }
        );

        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: 'Quiz not found'
            });
        }

        res.status(200).json({
            success: true,
            data: quiz
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Delete quiz
// @route   DELETE /api/quizzes/:id
// @access  Public
const deleteQuiz = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);

        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: 'Quiz not found'
            });
        }

        // Lấy tất cả question IDs từ quiz
        const questionIds = quiz.questions;

        console.log(questionIds);

        // Xóa tất cả questions liên quan
        if (questionIds.length > 0) {
            await Question.deleteMany({ _id: { $in: questionIds } });
            console.log(`Deleted ${questionIds.length} questions associated with quiz ${quiz._id}`);
        }

        // Xóa quiz
        await Quiz.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: `Quiz deleted successfully along with ${questionIds.length} associated questions`,
            deletedQuiz: {
                id: quiz._id,
                title: quiz.title,
                deletedQuestionsCount: questionIds.length
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
// @desc    Get quiz with questions containing keyword "capital"
// @route   GET /api/quizzes/:id/populate
// @access  Public
const getQuizWithCapitalQuestions = async (req, res) => {
    try {

        console.log(req.params.quizId);

        const quiz = await Quiz.findById(req.params.quizId).populate({
            path: 'questions',
            match: { keywords: { $in: ['capital'] } }
        });

        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: 'Quiz not found'
            });
        }

        // Filter out null questions (those that didn't match the keyword)
        const filteredQuestions = quiz.questions.filter(question => question !== null);

        res.status(200).json({
            success: true,
            data: {
                ...quiz.toObject(),
                questions: filteredQuestions
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Add a new question to a quiz
// @route   POST /api/quizzes/:quizId/question
// @access  Public
const addQuestionToQuiz = async (req, res) => {
    try {
        const { quizId } = req.params;
        let { text, options, keywords, correctAnswerIndex } = req.body;

        // Xử lý nếu options gửi lên là chuỗi (từ form HTML thuần)
        if (typeof options === 'string') {
            options = options.split(',').map(opt => opt.trim()).filter(opt => opt !== '');
        }

        // Tạo câu hỏi mới
        const question = await Question.create({
            text,
            options,
            keywords,
            correctAnswerIndex
        });

        // Đẩy ID câu hỏi vào mảng questions của Quiz
        const quiz = await Quiz.findByIdAndUpdate(
            quizId,
            { $push: { questions: question._id } },
            { new: true }
        ).populate('questions');

        if (!quiz) {
            await Question.findByIdAndDelete(question._id);
            return res.status(404).json({ success: false, message: 'Không tìm thấy Quiz' });
        }

        // Nếu bạn dùng EJS/Template engine để render:
        // res.redirect(`/quizzes/${quizId}`); 
        
        // Nếu dùng API thuần:
        res.status(201).json({ success: true, data: quiz });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Add multiple questions to a quiz
// @route   POST /api/quizzes/:quizId/questions
// @access  Public
const addQuestionsToQuiz = async (req, res) => {
    try {
        const { quizId } = req.params;
        const questions = Array.isArray(req.body) ? req.body : req.body.questions;

        if (!Array.isArray(questions) || questions.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide an array of questions'
            });
        }

        // Create multiple questions
        const createdQuestions = await Question.insertMany(questions);

        // Get question IDs
        const questionIds = createdQuestions.map(q => q._id);

        // Add questions to quiz
        const quiz = await Quiz.findByIdAndUpdate(
            quizId,
            { $push: { questions: { $each: questionIds } } },
            { new: true }
        ).populate('questions');

        if (!quiz) {
            // If quiz doesn't exist, delete the created questions
            await Question.deleteMany({ _id: { $in: questionIds } });
            return res.status(404).json({
                success: false,
                message: 'Quiz not found'
            });
        }

        res.status(201).json({
            success: true,
            data: quiz,
            addedQuestions: createdQuestions.length
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createQuiz,
    getQuizzes,
    getQuizById,
    updateQuiz,
    deleteQuiz,
    getQuizWithCapitalQuestions,
    addQuestionToQuiz,
    addQuestionsToQuiz
};