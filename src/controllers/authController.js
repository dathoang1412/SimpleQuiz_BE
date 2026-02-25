const User = require('../models/User');

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
    try {
        const { username, email, password, admin } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered'
            });
        }

        // Create user (admin defaults to false if not provided)
        const user = await User.create({
            username,
            email,
            password,
            admin: admin || false
        });

        // Generate token
        const token = user.generateToken();

        res.status(201).json({
            success: true,
            token,
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                admin: user.admin
            }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Find user and include password
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check password
        const isPasswordMatch = await user.comparePassword(password);

        if (!isPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate token
        const token = user.generateToken();

        res.status(200).json({
            success: true,
            token,
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                admin: user.admin
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        res.status(200).json({
            success: true,
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                admin: user.admin
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    register,
    login,
    getCurrentUser
};
