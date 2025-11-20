import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Lock, User, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import useAuthStore from '../../hooks/useAuthStore';

const ParentLogin = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password) {
      toast.error('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    try {
      setLoading(true);
      
      const response = await axios.post('http://localhost:5000/api/v1/auth/login', {
        username: formData.username,
        password: formData.password,
      });

      if (response.data.success) {
        const { user, token } = response.data.data;
        
        if (user.role !== 'parent') {
          toast.error('Đây là tài khoản không phải của phụ huynh');
          return;
        }

        // Sử dụng action `login` từ store để cập nhật trạng thái
        login({ user, token });
        
        toast.success('Đăng nhập thành công!');
        
        navigate('/parent/dashboard');
      }
    } catch (error) {
      console.error('Lỗi đăng nhập:', error);
      toast.error(error.response?.data?.message || 'Tên đăng nhập hoặc mật khẩu không đúng');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-600 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-white p-4 rounded-full shadow-lg">
              <Users size={48} className="text-yellow-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">SmartBus Parent</h1>
          <p className="text-yellow-100">Ứng dụng cho Phụ huynh</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Đăng nhập Phụ huynh
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên đăng nhập
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={20} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="Nhập tên đăng nhập"
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={20} className="text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="Nhập mật khẩu"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff size={20} className="text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye size={20} className="text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 bg-yellow-600 text-white rounded-lg font-semibold
                ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-yellow-700 active:bg-yellow-800'}
                transition-colors duration-200 shadow-lg`}
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>

          <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-800 font-medium mb-2">
              📝 Thông tin đăng nhập từ Database:
            </p>
            <div className="text-sm text-yellow-700 space-y-1">
              <p>• Tên đăng nhập: <span className="font-mono font-bold">parent1</span></p>
              <p>• Mật khẩu: <span className="font-mono font-bold">123456</span></p>
            </div>
          </div>
        </div>

        <p className="text-center text-yellow-100 text-sm mt-6">
          © 2025 SmartBus. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default ParentLogin;
