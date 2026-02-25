const Question = require('../models/Question');

// @desc    Create a new question
// @route   POST /api/questions
// @access  Public
const createQuestion = async (req, res) => {
    try {
        const { text, options, keywords, correctAnswerIndex } = req.body;

        // Validate that correctAnswerIndex is within options range
        if (correctAnswerIndex >= options.length) {
            return res.status(400).json({
                success: false,
                message: 'Correct answer index is out of range'
            });
        }

        const question = await Question.create({
            text,
            options,
            keywords,
            correctAnswerIndex,
            author: req.user._id
        });

        res.status(201).json({
            success: true,
            data: question
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get all questions
// @route   GET /api/questions
// @access  Public
const getQuestions = async (req, res) => {
    try {
        const questions = await Question.find().populate('author');
        
        res.status(200).json({
            success: true,
            count: questions.length,
            data: questions
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get single question
// @route   GET /api/questions/:id
// @access  Public
const getQuestionById = async (req, res) => {
    try {
        const question = await Question.findById(req.params.id).populate('author');
        
        if (!question) {
            return res.status(404).json({
                success: false,
                message: 'Question not found'
            });
        }

        res.status(200).json({
            success: true,
            data: question
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update question
// @route   PUT /api/questions/:id
// @access  Public
const updateQuestion = async (req, res) => {
    try {
        const { text, options, keywords, correctAnswerIndex } = req.body;

        // Validate that correctAnswerIndex is within options range
        if (correctAnswerIndex && options && correctAnswerIndex >= options.length) {
            return res.status(400).json({
                success: false,
                message: 'Correct answer index is out of range'
            });
        }

        const question = await Question.findByIdAndUpdate(
            req.params.id,
            { text, options, keywords, correctAnswerIndex },
            { new: true, runValidators: true }
        );

        if (!question) {
            return res.status(404).json({
                success: false,
                message: 'Question not found'
            });
        }

        res.status(200).json({
            success: true,
            data: question
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Delete question
// @route   DELETE /api/questions/:id
// @access  Public
const deleteQuestion = async (req, res) => {
    try {
        const question = await Question.findByIdAndDelete(req.params.id);

        if (!question) {
            return res.status(404).json({
                success: false,
                message: 'Question not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Question deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createQuestion,
    getQuestions,
    getQuestionById,
    updateQuestion,
    deleteQuestion
};