import React, { useState, useEffect, useRef } from 'react';
import { getAllDrivers } from '../../api/driverApi';
import { getChatHistory } from '../../api/messageApi';
import socketService from '../../api/socketService';
import useAuthStore from '../../hooks/useAuthStore';

const AdminChatWindow = ({ isOpen, onClose }) => {
  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  // Connect to the global store
  const { user, messageCache, loadMessagesForDriver } = useAuthStore((state) => ({
    user: state.user,
    messageCache: state.messageCache,
    loadMessagesForDriver: state.loadMessagesForDriver,
  }));

  // Messages are now derived directly from the global cache
  const messages = selectedDriver ? messageCache[selectedDriver.userId] || [] : [];

  // Effect to fetch the list of drivers when the window is opened
  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const response = await getAllDrivers();
        setDrivers(response);
      } catch (error) {
        console.error('Failed to fetch drivers:', error);
      }
    };

    if (isOpen) {
      fetchDrivers();
    }
  }, [isOpen]);

  // Effect to scroll to the bottom of the message list when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle selecting a driver from the list
  const handleSelectDriver = async (driver) => {
    setSelectedDriver(driver);
    // If conversation history is not in our global cache, fetch it
    if (!messageCache[driver.userId]) {
      console.log(`Cache miss for driver ${driver.userId}. Fetching history.`);
      try {
        const history = await getChatHistory(driver.userId);
        // Load the fetched history into the global store
        loadMessagesForDriver(driver.userId, history);
      } catch (error) {
        console.error('Failed to fetch chat history:', error);
        // If fetching fails, load an empty array to prevent future fetches
        loadMessagesForDriver(driver.userId, []);
      }
    } else {
      console.log(`Cache hit for driver ${driver.userId}. Displaying messages.`);
    }
  };

  // Handle sending a new message
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && selectedDriver) {
      const messageData = {
        recipientId: selectedDriver.userId,
        messageContent: newMessage,
      };
      socketService.emit('send_message', messageData);
      setNewMessage('');
    }
  };

  // Helper functions for formatting dates and times
  const shouldShowDate = (messages, index) => {
    if (index === 0) return true;
    const prevMessage = messages[index - 1];
    const currentMessage = messages[index];
    if (!prevMessage || !currentMessage || !prevMessage.timestamp || !currentMessage.timestamp) {
      return false;
    }
    const prevDate = new Date(prevMessage.timestamp).toDateString();
    const currentDate = new Date(currentMessage.timestamp).toDateString();
    return prevDate !== currentDate;
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (!isOpen) return null;

  return (
    <div style={styles.chatWindow}>
      <div style={styles.header}>
        <h2>Chat</h2>
        <button onClick={onClose} style={styles.closeButton}>X</button>
      </div>
      <div style={styles.container}>
        <div style={styles.driverList}>
          <h4>Tài xế</h4>
          <ul>
            {drivers.map((driver) => (
              <li
                key={driver.id}
                onClick={() => handleSelectDriver(driver)}
                style={selectedDriver?.id === driver.id ? styles.selectedDriver : {}}
              >
                {driver.fullName}
              </li>
            ))}
          </ul>
        </div>
        <div style={styles.chatArea} key={selectedDriver ? selectedDriver.userId : 'placeholder'}>
          {selectedDriver ? (
            <>
              <div style={styles.messageList}>
                {messages.map((msg, index) => (
                  <React.Fragment key={msg.id || index}>
                    {shouldShowDate(messages, index) && (
                      <div style={styles.dateSeparator}>
                        <span>{formatDate(msg.timestamp)}</span>
                      </div>
                    )}
                    <div style={msg.senderId === user.id ? styles.sentMessageContainer : styles.receivedMessageContainer}>
                      <div style={styles.timestamp}>{formatTime(msg.timestamp)}</div>
                      <div style={msg.senderId === user.id ? styles.sentMessage : styles.receivedMessage}>
                        {msg.messageContent}
                      </div>
                    </div>
                  </React.Fragment>
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

// Styles remain the same
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
        backgroundColor: '#3b82f6',
        color: 'white',
      },
      closeButton: {
        border: 'none',
        background: 'transparent',
        fontSize: '1.2rem',
        cursor: 'pointer',
        color: 'white',
      },
      container: {
        display: 'flex',
        flex: 1,
        minHeight: 0,
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
        minHeight: 0,
        overflow: 'hidden',
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
        boxSizing: 'border-box',
        alignItems: 'center',
      },
      messageInput: {
        flex: 1,
        border: '1px solid #ccc',
        borderRadius: '20px',
        padding: '8px 12px',
        marginRight: '10px',
        boxSizing: 'border-box',
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
      sentMessageContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    receivedMessageContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    timestamp: {
        color: '#888',
        fontSize: '0.8em',
        margin: '0 5px',
    },
    dateSeparator: {
        textAlign: 'center',
        color: '#888',
        margin: '10px 0',
    },
};

export default AdminChatWindow;