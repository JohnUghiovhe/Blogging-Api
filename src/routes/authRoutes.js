const express = require('express');
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

// Route for user sign-up
router.post('/signup', authController.signUp);

// Route for user sign-in
router.post('/signin', authController.signIn);

// Route for logout (clears httpOnly cookie)
router.get('/logout', authController.logout);

// Route to get current user (protected)
router.get('/me', authMiddleware, authController.me);

module.exports = router;