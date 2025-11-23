// backend/src/routes/chatRoutes.js
const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");
const { verifyToken } = require("../middleware/authMiddleware");

// All chat routes require authentication
router.use(verifyToken);

// POST /api/v1/chat/send - Send a message
router.post("/send", chatController.sendMessage);

// GET /api/v1/chat/history/:userId - Get chat history with a specific user
router.get("/history/:userId", chatController.getChatHistory);

// GET /api/v1/chat/conversations - Get all conversations
router.get("/conversations", chatController.getConversations);

// PUT /api/v1/chat/read/:userId - Mark messages as read
router.put("/read/:userId", chatController.markAsRead);

// GET /api/v1/chat/unread-count - Get unread message count
router.get("/unread-count", chatController.getUnreadCount);

// GET /api/v1/chat/drivers - Get all drivers (for admin)
router.get("/drivers", chatController.getAllDrivers);

// GET /api/v1/chat/admins - Get all admins (for driver)
router.get("/admins", chatController.getAllAdmins);

module.exports = router;
