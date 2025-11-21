// frontend/admin-dashboard/src/components/Layout/Layout.jsx

import React from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";

const Layout = ({ children }) => {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Header />
        <main style={{ padding: "20px", flex: 1, backgroundColor: "#f4f7f9" }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
