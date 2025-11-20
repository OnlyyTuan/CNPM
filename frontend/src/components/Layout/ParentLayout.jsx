import React, { useState, useEffect } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Bus, 
  Calendar, 
  GitBranch,
  UserCog,
  MapPin,
  Menu,
  X,
  LogOut
} from 'lucide-react';
import toast from 'react-hot-toast';
import ChatIcon from '../Chat/ChatIcon';
import AdminChatWindow from '../Chat/ParentChat';
import useAuthStore from '../../hooks/useAuthStore';
import socketService from '../../api/socketService';

const ParentLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isChatOpen, setChatOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  const { isLoggedIn, initializeSocketListeners, logout } = useAuthStore((state) => ({
    isLoggedIn: state.isLoggedIn,
    initializeSocketListeners: state.initializeSocketListeners,
    logout: state.logout,
  }));

  useEffect(() => {
    if (isLoggedIn) {
      console.log('User is logged in, initializing socket...');
      socketService.initSocket();
      initializeSocketListeners();
    }
  }, [isLoggedIn, initializeSocketListeners]);

  const toggleChat = () => {
    setChatOpen(!isChatOpen);
  };

  const menuItems = [
      { path: '/parent/dashboard', icon: LayoutDashboard, label: 'Dashboard' },

    ];

    const isActive = (path) => location.pathname === path;

  // Xử lý đăng xuất
  const handleLogout = () => {
    if (window.confirm('Bạn có chắc muốn đăng xuất?')) {
      logout(); // Use the logout action from the store
      toast.success('Đăng xuất thành công');
      navigate('/login/parent');
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-gradient-to-b from-blue-600 to-blue-800 text-white transition-all duration-300 flex flex-col`}
      >
        {/* Logo và Toggle Button */}
        <div className="flex items-center justify-between p-4 border-b border-blue-700">
          {sidebarOpen && (
            <div className="flex items-center space-x-2">
              <Bus className="w-8 h-8" />
              <span className="font-bold text-xl">SmartBus</span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-2 px-3">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive(item.path)
                        ? 'bg-white text-blue-600 shadow-lg'
                        : 'hover:bg-blue-700 text-white'
                    }`}
                    title={!sidebarOpen ? item.label : ''}
                  >
                    <Icon size={22} />
                    {sidebarOpen && (
                      <span className="font-medium">{item.label}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-blue-700">
          <button
            className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors w-full"
            onClick={handleLogout}
          >
            <LogOut size={22} />
            {sidebarOpen && <span className="font-medium">Đăng xuất</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm z-10">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-800">
                Quản lý Hệ thống Xe buýt Học sinh
              </h1>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  {/* <p className="text-sm font-medium text-gray-700">Admin</p>
                  <p className="text-xs text-gray-500">admin@smartbus.com</p> */}
                </div>
                {/* <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                  A
                </div> */}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-gray-50 p-6">
          <Outlet />
        </main>
      </div>
      <ChatIcon onClick={toggleChat} />
      <AdminChatWindow isOpen={isChatOpen} onClose={toggleChat} />
    </div>
  );
};

export default ParentLayout;