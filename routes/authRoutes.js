const express = require('express');
const router = express.Router();
const { register, login, resetPassword, forgotPassword } = require('../controllers/authController');


router.post('/login', login);
router.post('/register', register);
router.post("/forgot-password", forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;
