const express = require('express');
const authController = require('../controllers/authController');
const router = express.Router();

// Route for user sign-up
router.post('/signup', authController.signUp);

// Route for user sign-in
router.post('/signin', authController.signIn);

module.exports = router;