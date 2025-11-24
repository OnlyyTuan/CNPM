import React from "react";
import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
  const location = useLocation();
  const isActive = (p) => location.pathname === p;
  return (
    <div className="w-64 bg-white border-r h-full hidden md:block">
      <nav className="p-4 space-y-2">
        <Link to="/" className={`block px-3 py-2 rounded ${isActive("/") ? "bg-blue-100" : ""}`}>Dashboard</Link>
        <Link to="/children" className={`block px-3 py-2 rounded ${isActive("/children") ? "bg-blue-100" : ""}`}>Con của tôi</Link>
        <Link to="/live" className={`block px-3 py-2 rounded ${isActive("/live") ? "bg-blue-100" : ""}`}>Live Map</Link>
      </nav>
    </div>
  );
};

export default Sidebar;
