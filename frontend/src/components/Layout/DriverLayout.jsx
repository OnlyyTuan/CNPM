// frontend/src/components/Layout/DriverLayout.jsx
import React, { useState } from 'react';
import DriverChatWindow from '../DriverChat/DriverChatWindow';
import ChatIcon from '../Chat/ChatIcon'; // Re-using ChatIcon

const DriverLayout = ({ children }) => {
  const [isChatOpen, setChatOpen] = useState(false);

  const toggleChat = () => {
    setChatOpen(!isChatOpen);
  };

  return (
    <div style={{ padding: '20px' }}>
      {children}
      <ChatIcon onClick={toggleChat} />
      <DriverChatWindow isOpen={isChatOpen} onClose={toggleChat} />
    </div>
  );
};

export default DriverLayout;