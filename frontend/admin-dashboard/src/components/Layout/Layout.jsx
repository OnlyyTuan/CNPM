// frontend/admin-dashboard/src/components/Layout/Layout.jsx

import React, { useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import ChatIcon from "../Chat/ChatIcon";
import ChatWindow from "../Chat/ChatWindow";

const Layout = ({ children }) => {
  const [isChatOpen, setChatOpen] = useState(false);

  const toggleChat = () => {
    setChatOpen(!isChatOpen);
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Header />
        <main style={{ padding: "20px", flex: 1, backgroundColor: "#f4f7f9" }}>
          {children}
        </main>
      </div>
      <ChatIcon onClick={toggleChat} />
      <ChatWindow isOpen={isChatOpen} onClose={toggleChat} />
    </div>
  );
};

export default Layout;
