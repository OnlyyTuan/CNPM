// backend/src/controllers/chatController.js
const chatService = require("../services/chatService");

/**
 * Send a message
 */
const sendMessage = async (req, res) => {
  try {
    const { receiverId, message } = req.body;
    const senderId = req.user.id; // From auth middleware

    if (!receiverId || !message) {
      return res.status(400).json({
        success: false,
        message: "Receiver ID and message are required",
      });
    }

    const chatMessage = await chatService.sendMessage(
      senderId,
      receiverId,
      message
    );

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: chatMessage,
    });
  } catch (error) {
    console.error("Error in sendMessage controller:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to send message",
    });
  }
};

/**
 * Get chat history with a specific user
 */
const getChatHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const messages = await chatService.getChatHistory(currentUserId, userId);

    res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error("Error in getChatHistory controller:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get chat history",
    });
  }
};

/**
 * Get all conversations
 */
const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    const conversations = await chatService.getConversations(userId);

    res.status(200).json({
      success: true,
      data: conversations,
    });
  } catch (error) {
    console.error("Error in getConversations controller:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get conversations",
    });
  }
};

/**
 * Mark messages as read
 */
const markAsRead = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    await chatService.markMessagesAsRead(currentUserId, userId);

    res.status(200).json({
      success: true,
      message: "Messages marked as read",
    });
  } catch (error) {
    console.error("Error in markAsRead controller:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to mark messages as read",
    });
  }
};

/**
 * Get unread message count
 */
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await chatService.getUnreadCount(userId);

    res.status(200).json({
      success: true,
      data: { count },
    });
  } catch (error) {
    console.error("Error in getUnreadCount controller:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get unread count",
    });
  }
};

/**
 * Get all drivers (for admin)
 */
const getAllDrivers = async (req, res) => {
  try {
    const drivers = await chatService.getAllDrivers();

    res.status(200).json({
      success: true,
      data: drivers,
    });
  } catch (error) {
    console.error("Error in getAllDrivers controller:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get drivers",
    });
  }
};

/**
 * Get all admins (for driver)
 */
const getAllAdmins = async (req, res) => {
  try {
    const admins = await chatService.getAllAdmins();

    res.status(200).json({
      success: true,
      data: admins,
    });
  } catch (error) {
    console.error("Error in getAllAdmins controller:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get admins",
    });
  }
};

module.exports = {
  sendMessage,
  getChatHistory,
  getConversations,
  markAsRead,
  getUnreadCount,
  getAllDrivers,
  getAllAdmins,
};
