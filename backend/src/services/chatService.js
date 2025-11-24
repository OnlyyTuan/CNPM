// backend/src/services/chatService.js
const { v4: uuidv4 } = require("uuid");
const db = require("../db");
const { Op } = require("sequelize");

const ChatMessage = db.ChatMessage;
const User = db.User;

/**
 * Send a message from one user to another
 */
const sendMessage = async (senderId, receiverId, message) => {
  try {
    // Validate sender and receiver exist
    const sender = await User.findByPk(senderId);
    const receiver = await User.findByPk(receiverId);

    if (!sender) {
      throw new Error("Sender not found");
    }
    if (!receiver) {
      throw new Error("Receiver not found");
    }

    const chatMessage = await ChatMessage.create({
      id: uuidv4(),
      senderId,
      receiverId,
      message,
      isRead: false,
      createdAt: new Date(),
    });

    return chatMessage;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

/**
 * Get chat history between two users
 */
const getChatHistory = async (userId1, userId2) => {
  try {
    const messages = await ChatMessage.findAll({
      where: {
        [Op.or]: [
          { senderId: userId1, receiverId: userId2 },
          { senderId: userId2, receiverId: userId1 },
        ],
      },
      order: [["createdAt", "ASC"]],
      raw: true, // Return plain objects
    });

    return messages;
  } catch (error) {
    console.error("Error getting chat history:", error);
    throw error;
  }
};

/**
 * Get all conversations for a user (list of users they've chatted with)
 */
const getConversations = async (userId) => {
  try {
    const messages = await ChatMessage.findAll({
      where: {
        [Op.or]: [{ senderId: userId }, { receiverId: userId }],
      },
      order: [["createdAt", "DESC"]],
      raw: true,
    });

    // Extract unique conversation partners
    const conversationMap = new Map();
    
    for (const msg of messages) {
      const partnerId = msg.senderId === userId ? msg.receiverId : msg.senderId;
      
      if (!conversationMap.has(partnerId)) {
        // Get partner user info
        const partner = await User.findByPk(partnerId, {
          attributes: ["id", "username", "role"],
          raw: true,
        });
        
        if (partner) {
          conversationMap.set(partnerId, {
            userId: partnerId,
            username: partner.username,
            role: partner.role,
            lastMessage: msg.message,
            lastMessageTime: msg.createdAt,
            unreadCount: 0,
          });
        }
      }
      
      // Count unread messages
      if (msg.receiverId === userId && !msg.isRead) {
        conversationMap.get(partnerId).unreadCount += 1;
      }
    }

    return Array.from(conversationMap.values());
  } catch (error) {
    console.error("Error getting conversations:", error);
    throw error;
  }
};

/**
 * Mark messages as read
 */
const markMessagesAsRead = async (userId, otherUserId) => {
  try {
    await ChatMessage.update(
      { isRead: true },
      {
        where: {
          senderId: otherUserId,
          receiverId: userId,
          isRead: false,
        },
      }
    );
    return { success: true };
  } catch (error) {
    console.error("Error marking messages as read:", error);
    throw error;
  }
};

/**
 * Get unread message count for a user
 */
const getUnreadCount = async (userId) => {
  try {
    const count = await ChatMessage.count({
      where: {
        receiverId: userId,
        isRead: false,
      },
    });
    return count;
  } catch (error) {
    console.error("Error getting unread count:", error);
    throw error;
  }
};

/**
 * Get all drivers for admin to chat with
 */
const getAllDrivers = async () => {
  try {
    const drivers = await User.findAll({
      where: { role: "DRIVER" },
      attributes: ["id", "username", "email", "role"],
      include: [
        {
          model: db.Driver,
          as: "DriverProfile",
          attributes: ["id", "fullName", "phone"],
        },
      ],
    });
    return drivers;
  } catch (error) {
    console.error("Error getting drivers:", error);
    throw error;
  }
};

/**
 * Get all admins for driver to chat with
 */
const getAllAdmins = async () => {
  try {
    const admins = await User.findAll({
      where: { role: "ADMIN" },
      attributes: ["id", "username", "email", "role"],
      raw: true,
    });
    return admins;
  } catch (error) {
    console.error("Error getting admins:", error);
    throw error;
  }
};

module.exports = {
  sendMessage,
  getChatHistory,
  getConversations,
  markMessagesAsRead,
  getUnreadCount,
  getAllDrivers,
  getAllAdmins,
};
