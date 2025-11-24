import React, { useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";

const Layout = ({ children }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-gray-100 flex">
      <div className={`fixed inset-0 bg-black/20 ${open ? "block" : "hidden"}`} onClick={() => setOpen(false)} />
      <div className={`fixed md:static z-10 ${open ? "block" : "hidden"} md:block`}>
        <Sidebar />
      </div>
      <div className="flex-1 ml-0 md:ml-64">
        <Header />
        <div className="p-4">
          {children}
        </div>
      </div>
      <button className="fixed bottom-4 right-4 md:hidden bg-blue-600 text-white rounded-full px-4 py-2" onClick={() => setOpen(!open)}>
        Menu
      </button>
    </div>
  );
};

export default Layout;
