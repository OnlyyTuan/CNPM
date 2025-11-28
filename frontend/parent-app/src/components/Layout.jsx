import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Bell, 
  Home, 
  LogOut, 
  Menu, 
  X, 
  User,
  Bus
} from 'lucide-react';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    if (window.confirm('Bạn có chắc muốn đăng xuất?')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  const navItems = [
    { path: '/dashboard', label: 'Trang chủ', icon: Home },
    { path: '/notifications', label: 'Thông báo', icon: Bell },
  ];

  // Check active route
  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-gradient-to-b from-pink-600 to-pink-700 text-white transition-all duration-300 flex flex-col shrink-0 relative z-20`}
      >
        {/* Logo + Toggle */}
        <div className="flex items-center justify-between p-4 border-b border-pink-700">
          {sidebarOpen && (
            <div className="flex items-center space-x-2 overflow-hidden">
              <Bus className="w-8 h-8 flex-shrink-0" />
              <span className="font-bold text-lg truncate">Parent Portal</span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-pink-700 transition-colors focus:outline-none"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-2 px-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                      isActive(item.path)
                        ? 'bg-white text-pink-600 shadow-lg'
                        : 'hover:bg-pink-700 text-white'
                    }`}
                    title={!sidebarOpen ? item.label : ''}
                  >
                    <Icon size={22} className="flex-shrink-0" />
                    {sidebarOpen && (
                      <span className="font-medium truncate">{item.label}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-pink-700">
          <button
            className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-pink-700 transition-colors w-full text-left group"
            onClick={handleLogout}
            title={!sidebarOpen ? "Đăng xuất" : ""}
          >
            <LogOut size={22} className="flex-shrink-0" />
            {sidebarOpen && <span className="font-medium truncate">Đăng xuất</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        {/* Header */}
        <header className="bg-white shadow-sm z-10 flex-shrink-0">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800 truncate">
                Cổng thông tin Phụ huynh
              </h2>
              <div className="flex items-center space-x-4 ml-4">
                <div className="text-right hidden md:block">
                  <p className="text-sm font-medium text-gray-700 truncate max-w-[150px]">
                    {user.fullName || user.username || "Phụ huynh"}
                  </p>
                  <p className="text-xs text-gray-500">Parent</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center font-bold border border-pink-200 shrink-0">
                  <User size={20} />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto bg-gray-50 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;