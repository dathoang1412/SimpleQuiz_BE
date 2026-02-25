const express = require('express');
const router = express.Router();
const {
    register,
    login,
    getCurrentUser
} = require('../controllers/authController');
const { verifyUser } = require('../middleware/authenticate');

// Auth routes
router.post('/register', register);
router.post('/login', login);
router.get('/me', verifyUser, getCurrentUser);

module.exports = router;
