// frontend/admin-dashboard/src/api/chatApi.js

import axiosClient from "./axiosClient";

const chatApi = {
  /**
   * Send a message to a user
   */
  sendMessage: (receiverId, message) => {
    return axiosClient.post("/chat/send", { receiverId, message });
  },

  /**
   * Get chat history with a specific user
   */
  getChatHistory: (userId) => {
    return axiosClient.get(`/chat/history/${userId}`);
  },

  /**
   * Get all conversations
   */
  getConversations: () => {
    return axiosClient.get("/chat/conversations");
  },

  /**
   * Mark messages as read
   */
  markAsRead: (userId) => {
    return axiosClient.put(`/chat/read/${userId}`);
  },

  /**
   * Get unread message count
   */
  getUnreadCount: () => {
    return axiosClient.get("/chat/unread-count");
  },

  /**
   * Get all drivers (for admin)
   */
  getAllDrivers: () => {
    return axiosClient.get("/chat/drivers");
  },
};

export default chatApi;
