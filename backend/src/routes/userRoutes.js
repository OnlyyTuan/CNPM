// backend/src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// Route để parent/driver lấy thông tin admin để chat
router.get('/admin', protect, userController.getFirstAdmin);

// Route để admin lấy danh sách users có thể chat
router.get('/chat-users', protect, userController.getChatUsers);

module.exports = router;
