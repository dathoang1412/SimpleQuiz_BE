const express = require('express');
const router = express.Router();
const {
    createQuiz,
    getQuizzes,
    getQuizById,
    updateQuiz,
    deleteQuiz,
    getQuizWithCapitalQuestions,
    addQuestionToQuiz,
    addQuestionsToQuiz
} = require('../controllers/quizController');
const { verifyUser, verifyAdmin } = require('../middleware/authenticate');

// Quiz routes
router.route('/')
    .post(verifyUser, verifyAdmin, createQuiz)
    .get(getQuizzes);

router.route('/:id')
    .get(getQuizById)
    .put(verifyUser, verifyAdmin, updateQuiz)
    .delete(verifyUser, verifyAdmin, deleteQuiz);

router.route('/:quizId/populate')
    .get(getQuizWithCapitalQuestions);

router.route('/:quizId/question')
    .post(verifyUser, verifyAdmin, addQuestionToQuiz);

router.route('/:quizId/questions')
    .post(verifyUser, verifyAdmin, addQuestionsToQuiz);

module.exports = router;