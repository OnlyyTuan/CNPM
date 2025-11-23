// frontend/driver-app/src/pages/Chat/ChatPage.jsx

import React, { useState, useEffect, useRef } from "react";
import chatApi from "../../api/chatApi";

const ChatPage = () => {
  const [adminUsers, setAdminUsers] = useState([]);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const messagesEndRef = useRef(null);
  const pollingIntervalRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load current user info and admins
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setCurrentUser(user);
    loadAdmins();
  }, []);

  // Auto-refresh messages when an admin is selected
  useEffect(() => {
    // Clear any existing interval
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    // Set up polling if an admin is selected
    if (selectedAdmin) {
      pollingIntervalRef.current = setInterval(() => {
        loadChatHistorySilent(selectedAdmin.userId);
      }, 3000); // Refresh every 3 seconds
    }

    // Cleanup on unmount or when selectedAdmin changes
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [selectedAdmin]);

  // Load all admins
  const loadAdmins = async () => {
    try {
      const response = await chatApi.getAllAdmins();
      const admins = response.data.data || [];
      
      // Transform to match the expected format
      const adminList = admins.map(admin => ({
        userId: admin.id,
        username: admin.username,
        role: admin.role,
        lastMessage: "",
        unreadCount: 0,
      }));
      
      setAdminUsers(adminList);

      // Auto-select first admin if available
      if (adminList.length > 0 && !selectedAdmin) {
        handleSelectAdmin(adminList[0]);
      }
    } catch (error) {
      console.error("Error loading admins:", error);
    }
  };

  // Load chat history when an admin is selected (with loading indicator)
  const loadChatHistory = async (adminId) => {
    try {
      setLoading(true);
      const response = await chatApi.getChatHistory(adminId);
      setMessages(response.data.data || []);
      // Mark messages as read
      await chatApi.markAsRead(adminId);
    } catch (error) {
      console.error("Error loading chat history:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load chat history silently (for auto-refresh, no loading indicator)
  const loadChatHistorySilent = async (adminId) => {
    try {
      const response = await chatApi.getChatHistory(adminId);
      const newMessages = response.data.data || [];
      
      // Only update if messages have changed
      if (JSON.stringify(newMessages) !== JSON.stringify(messages)) {
        setMessages(newMessages);
      }
      
      // Mark messages as read
      await chatApi.markAsRead(adminId);
    } catch (error) {
      console.error("Error loading chat history:", error);
    }
  };

  // Handle admin selection
  const handleSelectAdmin = (admin) => {
    setSelectedAdmin(admin);
    loadChatHistory(admin.userId);
  };

  // Send a message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedAdmin) return;

    try {
      const response = await chatApi.sendMessage(
        selectedAdmin.userId,
        newMessage.trim()
      );
      
      // Add the new message to the list
      setMessages([...messages, response.data.data]);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message");
    }
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar - Admin List */}
      <div className="w-1/4 bg-white border-r border-gray-300 overflow-y-auto">
        <div className="p-4 bg-green-600 text-white">
          <h2 className="text-xl font-bold">Chat with Admin</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {adminUsers.map((admin) => (
            <div
              key={admin.userId}
              onClick={() => handleSelectAdmin(admin)}
              className={`p-4 cursor-pointer hover:bg-gray-50 transition ${
                selectedAdmin?.userId === admin.userId ? "bg-green-50" : ""
              }`}
            >
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                  {admin.username?.charAt(0).toUpperCase()}
                </div>
                <div className="ml-3 flex-1">
                  <p className="font-semibold text-gray-800">
                    {admin.username}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {admin.lastMessage}
                  </p>
                  {admin.unreadCount > 0 && (
                    <span className="inline-block bg-red-500 text-white text-xs px-2 py-1 rounded-full mt-1">
                      {admin.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
          {adminUsers.length === 0 && (
            <div className="p-4 text-center text-gray-500">
              No conversations yet
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedAdmin ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-300 p-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                  {selectedAdmin.username?.charAt(0).toUpperCase()}
                </div>
                <div className="ml-3">
                  <p className="font-semibold text-gray-800">
                    {selectedAdmin.username}
                  </p>
                  <p className="text-sm text-gray-500">Admin</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {loading ? (
                <div className="text-center text-gray-500">
                  Loading messages...
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center text-gray-500">
                  No messages yet. Start a conversation!
                </div>
              ) : (
                messages.map((msg) => {
                  const isSentByMe = msg.senderId === currentUser?.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${
                        isSentByMe ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-2 rounded-lg ${
                          isSentByMe
                            ? "bg-green-500 text-white"
                            : "bg-white text-gray-800 border border-gray-300"
                        }`}
                      >
                        <p className="break-words">{msg.message}</p>
                        <p
                          className={`text-xs mt-1 ${
                            isSentByMe ? "text-green-100" : "text-gray-500"
                          }`}
                        >
                          {formatTime(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-300 p-4">
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  type="submit"
                  className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition font-semibold"
                  disabled={!newMessage.trim()}
                >
                  Send
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            No conversations available
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
