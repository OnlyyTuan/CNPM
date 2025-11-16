import React, { useState, useEffect, useRef } from 'react';
import apiServices from '../../../api/adminApi';
import { socketService } from '../../../api';
import useAuthStore from '../../../hooks/useAuthStore';

const ChatWindow = ({ isOpen, onClose }) => {
  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const { user } = useAuthStore();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      // Kết nối socket khi component mở
      socketService.connect();

      // Lắng nghe tin nhắn mới
      socketService.on('receive_message', (message) => {
        // Chỉ cập nhật nếu tin nhắn thuộc về cuộc trò chuyện đang xem
        if (message.senderId === selectedDriver?.user_id || message.recipientId === selectedDriver?.user_id) {
          setMessages((prevMessages) => [...prevMessages, message]);
        }
      });

      // Lấy danh sách tài xế
      const fetchDrivers = async () => {
        try {
          const response = await apiServices.getAllDrivers();
          setDrivers(response.data);
        } catch (error) {
          console.error('Failed to fetch drivers:', error);
        }
      };
      fetchDrivers();
    }

    return () => {
      // Ngắt kết nối socket khi component đóng
      // socketService.disconnect(); // Cân nhắc việc ngắt kết nối ở đây
    };
  }, [isOpen, selectedDriver]);

  useEffect(() => {
    // Cuộn xuống tin nhắn mới nhất
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSelectDriver = async (driver) => {
    setSelectedDriver(driver);
    // Lấy lịch sử chat
    try {
      const response = await apiServices.getChatHistory(driver.user_id);
      setMessages(response.data);
    } catch (error) {
      console.error('Failed to fetch chat history:', error);
      setMessages([]);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && selectedDriver) {
      const messageData = {
        recipientId: selectedDriver.user_id,
        messageContent: newMessage,
      };
      socketService.emit('send_message', messageData);
      
      // Thêm tin nhắn đã gửi vào danh sách ngay lập tức (optimistic update)
      const optimisticMessage = {
        id: Date.now(),
        messageContent: newMessage,
        senderId: user.id, // ID của admin
        recipientId: selectedDriver.user_id,
        Sender: { username: user.username },
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, optimisticMessage]);

      setNewMessage('');
    }
  };

  if (!isOpen) return null;

  return (
    <div style={styles.chatWindow}>
      <div style={styles.header}>
        <h2>Chat</h2>
        <button onClick={onClose} style={styles.closeButton}>X</button>
      </div>
      <div style={styles.container}>
        {/* Danh sách tài xế */}
        <div style={styles.driverList}>
          <h4>Tài xế</h4>
          <ul>
            {drivers.map((driver) => (
              <li 
                key={driver.id} 
                onClick={() => handleSelectDriver(driver)}
                style={selectedDriver?.id === driver.id ? styles.selectedDriver : {}}
              >
                {driver.full_name}
              </li>
            ))}
          </ul>
        </div>
        {/* Khung chat */}
        <div style={styles.chatArea}>
          {selectedDriver ? (
            <>
              <div style={styles.chatHeader}>Chat với {selectedDriver.full_name}</div>
              <div style={styles.messageList}>
                {messages.map((msg) => (
                  <div key={msg.id} style={msg.senderId === user.id ? styles.sentMessage : styles.receivedMessage}>
                    <strong>{msg.Sender?.username}: </strong>{msg.messageContent}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <form onSubmit={handleSendMessage} style={styles.messageInputForm}>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Nhập tin nhắn..."
                  style={styles.messageInput}
                />
                <button type="submit" style={styles.sendButton}>Gửi</button>
              </form>
            </>
          ) : (
            <div style={styles.placeholder}>Chọn một tài xế để bắt đầu chat</div>
          )}
        </div>
      </div>
    </div>
  );
};

// CSS-in-JS styles
const styles = {
    chatWindow: {
        position: 'fixed',
        bottom: '90px',
        right: '20px',
        width: '500px',
        height: '400px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1000,
      },
      header: {
        padding: '10px',
        borderBottom: '1px solid #eee',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      },
      closeButton: {
        border: 'none',
        background: 'transparent',
        fontSize: '1.2rem',
        cursor: 'pointer',
      },
      container: {
        display: 'flex',
        height: '100%',
      },
      driverList: {
        width: '150px',
        borderRight: '1px solid #eee',
        padding: '10px',
        overflowY: 'auto',
      },
      selectedDriver: {
        backgroundColor: '#e0e0e0',
        cursor: 'pointer',
      },
      chatArea: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
      },
      chatHeader: {
        padding: '10px',
        borderBottom: '1px solid #eee',
        fontWeight: 'bold',
      },
      messageList: {
        flex: 1,
        padding: '10px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      },
      sentMessage: {
        alignSelf: 'flex-end',
        backgroundColor: '#007bff',
        color: 'white',
        padding: '8px 12px',
        borderRadius: '18px',
        maxWidth: '70%',
      },
      receivedMessage: {
        alignSelf: 'flex-start',
        backgroundColor: '#f1f1f1',
        padding: '8px 12px',
        borderRadius: '18px',
        maxWidth: '70%',
      },
      messageInputForm: {
        display: 'flex',
        padding: '10px',
        borderTop: '1px solid #eee',
      },
      messageInput: {
        flex: 1,
        border: '1px solid #ccc',
        borderRadius: '20px',
        padding: '8px 12px',
        marginRight: '10px',
      },
      sendButton: {
        padding: '8px 15px',
        borderRadius: '20px',
        border: 'none',
        backgroundColor: '#007bff',
        color: 'white',
        cursor: 'pointer',
      },
      placeholder: {
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: '#aaa',
      },
};

export default ChatWindow;
