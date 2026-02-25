const express = require('express');
const router = express.Router();
const {
    createQuestion,
    getQuestions,
    getQuestionById,
    updateQuestion,
    deleteQuestion
} = require('../controllers/questionController');
const { verifyUser, verifyAdmin, verifyAuthor } = require('../middleware/authenticate');

// Question routes
router.route('/')
    .post(verifyUser, verifyAdmin, createQuestion)
    .get(getQuestions);

router.route('/:id')
    .get(getQuestionById)
    .put(verifyUser, verifyAuthor, updateQuestion)
    .delete(verifyUser, verifyAuthor, deleteQuestion);

module.exports = router;