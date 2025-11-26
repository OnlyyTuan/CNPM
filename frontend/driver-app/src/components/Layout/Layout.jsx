// frontend/admin-dashboard/src/components/Layout/Layout.jsx

import React from "react";
import { useLocation } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";

const Layout = ({ children }) => {
  const location = useLocation();
  const isChatPage = location.pathname === "/chat";

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <Sidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Header />
        <main
          style={{
            padding: isChatPage ? 0 : "20px",
            flex: 1,
            backgroundColor: "#f4f7f9",
            overflowY: isChatPage ? "hidden" : "auto", // Use overflowY for clarity
            display: isChatPage ? "flex" : "block",
            flexDirection: isChatPage ? "column" : "row",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
