// frontend/src/components/Chat/ChatIcon.jsx
import React from 'react';
import { MessageSquare } from 'lucide-react';

const ChatIcon = ({ onClick }) => {
  return (
    <div
      onClick={onClick}
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        backgroundColor: '#007bff',
        color: 'white',
        borderRadius: '50%',
        width: '60px',
        height: '60px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
        boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
        zIndex: 1000,
      }}
    >
      <MessageSquare size={32} />
    </div>
  );
};

export default ChatIcon;