// backend/src/routes/authRoutes.js
// Routes cho authentication

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// POST /api/v1/auth/login - Đăng nhập
router.post('/login', authController.login);

// GET /api/v1/auth/me - Lấy thông tin user hiện tại (cần token)
// router.get('/me', authMiddleware, authController.me);

module.exports = router;
