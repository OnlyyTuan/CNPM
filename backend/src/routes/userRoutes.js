// backend/src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// Route để tài xế lấy thông tin admin để chat
router.get('/admin', protect, userController.getFirstAdmin);

module.exports = router;
