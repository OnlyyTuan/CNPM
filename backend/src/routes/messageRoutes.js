// backend/src/routes/messageRoutes.js
const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/history/:otherUserId', authMiddleware.protect, messageController.getChatHistory);

module.exports = router;
