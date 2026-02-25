const express = require('express');
const router = express.Router();
const { getUsers } = require('../controllers/userController');
const { verifyUser, verifyAdmin } = require('../middleware/authenticate');

// User routes
router.route('/')
    .get(verifyUser, verifyAdmin, getUsers);

module.exports = router;
