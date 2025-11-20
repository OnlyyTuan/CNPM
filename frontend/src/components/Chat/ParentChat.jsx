import React, { useState, useEffect, useRef } from 'react';
import { socketService, getChatHistory, getFirstAdmin } from '../../api';
import useAuthStore from '../../hooks/useAuthStore';

const ParentChat = ({ isOpen, onClose }) => {
  const [admin, setAdmin] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const { user } = useAuthStore();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const fetchAdminAndHistory = async () => {
      try {
        const adminUser = await getFirstAdmin();
        setAdmin(adminUser);
        const history = await getChatHistory(adminUser.id);
        setMessages(history);
      } catch (error) {
        console.error('Failed to fetch admin user or chat history:', error);
      }
    };

    fetchAdminAndHistory();
    socketService.initSocket(); // Initialize a fresh socket connection

  }, [isOpen]);

  // Effect to manage socket message receiving
  useEffect(() => {
    if (!isOpen || !admin) return;

    const handleReceiveMessage = (message) => {
      console.log('%c[Driver] Đã nhận sự kiện "receive_message":', 'color: blue; font-weight: bold;', message);
      console.log(`[Driver] ID người dùng hiện tại: ${user.id}`);
      console.log(`[Driver] ID admin: ${admin?.id}`);
      
      const isAdminSender = admin && message.senderId === admin.id && message.recipientId === user.id;
      const isUserSender = admin && message.senderId === user.id && message.recipientId === admin.id;

      if (isAdminSender || isUserSender) {
        console.log('%c[Driver] Tin nhắn hợp lệ, đang cập nhật giao diện...', 'color: blue;');
        setMessages((prevMessages) => {
          if (prevMessages.some((m) => m.id === message.id)) {
            return prevMessages;
          }
          return [...prevMessages, message];
        });
      } else {
        console.log('%c[Driver] Tin nhắn không thuộc cuộc trò chuyện này. Đang bỏ qua.', 'color: orange;');
      }
    };

    

    socketService.on('receive_message', handleReceiveMessage);
    return () => {
      socketService.off('receive_message', handleReceiveMessage);
    };
  }, [isOpen, user.id, admin]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && admin) {
      const messageData = {
        recipientId: admin.id,
        messageContent: newMessage,
      };
      socketService.emit('send_message', messageData);
      setNewMessage('');
    }
  };

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
        <h2>Chat với Admin</h2>
        <button onClick={onClose} style={styles.closeButton}>X</button>
      </div>
      <div style={styles.chatArea}>
        {admin ? (
          <>
            <div style={styles.messageList}>
              {messages.map((msg, index) => (
                <React.Fragment key={msg.id}>
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
          <div style={styles.placeholder}>Đang kết nối...</div>
        )}
      </div>
    </div>
  );
};

// CSS-in-JS styles from Admin's ChatWindow
const styles = {
    chatWindow: {
        position: 'fixed',
        bottom: '90px',
        right: '20px',
        width: '400px',
        height: '500px',
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
      chatArea: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
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

export default ParentChat;