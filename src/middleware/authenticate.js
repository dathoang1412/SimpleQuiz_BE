const User = require('../models/User');
const jwt = require('jsonwebtoken');

// @desc    Verify if user is authenticated
// @access  Private
const verifyUser = async (req, res, next) => {
    try {
        let userId;

        // Check for JWT token in Authorization header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            try {
                // Extract token
                const token = req.headers.authorization.split(' ')[1];

                // Verify token
                const decoded = jwt.verify(
                    token,
                    process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'
                );

                userId = decoded.id;
            } catch (error) {
                return next({
                    status: 401,
                    message: 'Invalid or expired token'
                });
            }
        }
        // Fallback to x-user-id header for testing/backward compatibility
        else if (req.headers['x-user-id']) {
            userId = req.headers['x-user-id'];
        }

        if (!userId) {
            return next({
                status: 401,
                message: 'User not authenticated'
            });
        }

        // Load user information from database
        const user = await User.findById(userId);

        if (!user) {
            return next({
                status: 401,
                message: 'User not found'
            });
        }

        // Attach user to request object
        req.user = user;
        next();
    } catch (error) {
        next({
            status: 401,
            message: 'Authentication failed'
        });
    }
};

// @desc    Verify if user is an Admin
// @access  Private
const verifyAdmin = async (req, res, next) => {
    try {
        // Check if user is authenticated first (verifyUser should run before this)
        if (!req.user) {
            return next({
                status: 401,
                message: 'User not authenticated'
            });
        }

        // Check if user has admin privileges
        if (!req.user.admin) {
            return next({
                status: 403,
                message: 'You are not authorized to perform this operation!'
            });
        }

        next();
    } catch (error) {
        next({
            status: 403,
            message: 'Authorization check failed'
        });
    }
};

// @desc    Verify if user is the author of a question
// @access  Private
const verifyAuthor = async (req, res, next) => {
    try {
        const Question = require('../models/Question');

        // Check if user is authenticated
        if (!req.user) {
            return next({
                status: 401,
                message: 'User not authenticated'
            });
        }

        // Get question ID from route parameters
        const questionId = req.params.id;

        // Retrieve the question from database
        const question = await Question.findById(questionId);

        if (!question) {
            return next({
                status: 404,
                message: 'Question not found'
            });
        }

        // Allow if user is an admin OR the author
        const isAdmin = req.user.admin === true;
        const isAuthor = question.author && question.author.toString() === req.user._id.toString();

        if (!isAdmin && !isAuthor) {
            console.log(`[Auth Failed] User ${req.user._id} (Admin: ${isAdmin}) attempted to modify question ${questionId} (Author: ${question.author})`);
            return next({
                status: 403,
                message: 'You are not authorized to modify this question'
            });
        }

        // Attach question to request for use in controller
        req.question = question;
        next();
    } catch (error) {
        next({
            status: 403,
            message: 'Author verification failed: ' + error.message
        });
    }
};

module.exports = {
    verifyUser,
    verifyAdmin,
    verifyAuthor
};
