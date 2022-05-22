const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller')

// Route for logging in users
router.post("/api/auth/login", authController.validateLogin, authController.login);

module.exports = router;