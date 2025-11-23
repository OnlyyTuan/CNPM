// frontend/src/pages/Chat/ChatPage.jsx

import React, { useState, useEffect, useRef } from "react";
import chatApi from "../../api/chatApi";

const ChatPage = () => {
  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
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

  // Load current user info
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setCurrentUser(user);
    loadDrivers();
  }, []);

  // Auto-refresh messages when a driver is selected
  useEffect(() => {
    // Clear any existing interval
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    // Set up polling if a driver is selected
    if (selectedDriver) {
      pollingIntervalRef.current = setInterval(() => {
        loadChatHistorySilent(selectedDriver.id);
      }, 3000); // Refresh every 3 seconds
    }

    // Cleanup on unmount or when selectedDriver changes
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [selectedDriver]);

  // Load all drivers
  const loadDrivers = async () => {
    try {
      const response = await chatApi.getAllDrivers();
      setDrivers(response.data.data || []);
    } catch (error) {
      console.error("Error loading drivers:", error);
    }
  };

  // Load chat history when a driver is selected (with loading indicator)
  const loadChatHistory = async (driverId) => {
    try {
      setLoading(true);
      const response = await chatApi.getChatHistory(driverId);
      setMessages(response.data.data || []);
      // Mark messages as read
      await chatApi.markAsRead(driverId);
    } catch (error) {
      console.error("Error loading chat history:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load chat history silently (for auto-refresh, no loading indicator)
  const loadChatHistorySilent = async (driverId) => {
    try {
      const response = await chatApi.getChatHistory(driverId);
      const newMessages = response.data.data || [];
      
      // Only update if messages have changed
      if (JSON.stringify(newMessages) !== JSON.stringify(messages)) {
        setMessages(newMessages);
      }
      
      // Mark messages as read
      await chatApi.markAsRead(driverId);
    } catch (error) {
      console.error("Error loading chat history:", error);
    }
  };

  // Handle driver selection
  const handleSelectDriver = (driver) => {
    setSelectedDriver(driver);
    loadChatHistory(driver.id);
  };

  // Send a message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedDriver) return;

    try {
      const response = await chatApi.sendMessage(
        selectedDriver.id,
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
    <div className="flex h-[calc(100vh-4rem)] bg-gray-100">
      {/* Sidebar - Driver List */}
      <div className="w-1/4 bg-white border-r border-gray-300 overflow-y-auto">
        <div className="p-4 bg-blue-600 text-white">
          <h2 className="text-xl font-bold">Driver Chat</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {drivers.map((driver) => (
            <div
              key={driver.id}
              onClick={() => handleSelectDriver(driver)}
              className={`p-4 cursor-pointer hover:bg-gray-50 transition ${
                selectedDriver?.id === driver.id ? "bg-blue-50" : ""
              }`}
            >
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                  {driver.username?.charAt(0).toUpperCase()}
                </div>
                <div className="ml-3 flex-1">
                  <p className="font-semibold text-gray-800">
                    {driver.DriverProfile?.fullName || driver.username}
                  </p>
                  <p className="text-sm text-gray-500">{driver.username}</p>
                </div>
              </div>
            </div>
          ))}
          {drivers.length === 0 && (
            <div className="p-4 text-center text-gray-500">
              No drivers available
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedDriver ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-300 p-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                  {selectedDriver.username?.charAt(0).toUpperCase()}
                </div>
                <div className="ml-3">
                  <p className="font-semibold text-gray-800">
                    {selectedDriver.DriverProfile?.fullName ||
                      selectedDriver.username}
                  </p>
                  <p className="text-sm text-gray-500">
                    {selectedDriver.username}
                  </p>
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
                            ? "bg-blue-500 text-white"
                            : "bg-white text-gray-800 border border-gray-300"
                        }`}
                      >
                        <p className="break-words">{msg.message}</p>
                        <p
                          className={`text-xs mt-1 ${
                            isSentByMe ? "text-blue-100" : "text-gray-500"
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
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition font-semibold"
                  disabled={!newMessage.trim()}
                >
                  Send
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a driver to start chatting
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
