// frontend/driver-app/src/pages/Auth/LoginPage.jsx
// Trang đăng nhập cho Driver

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bus, Lock, User, Eye, EyeOff } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import useAuthStore from "../../hooks/useAuthStore";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
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
      toast.error("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    try {
      setLoading(true);

      // Gọi API đăng nhập
      const response = await axios.post(
        "http://localhost:5000/api/v1/auth/login",
        {
          username: formData.username,
          password: formData.password,
        }
      );

      if (response.data && response.data.success) {
        // Support two backend response shapes:
        // 1) { success, data: { user, token } }  (authController)
        // 2) { success, user, token }            (other endpoints)
        let user, token;
        if (response.data.data) {
          user = response.data.data.user;
          token = response.data.data.token;
        } else {
          user = response.data.user || null;
          token = response.data.token || null;
        }

        // Kiểm tra role driver hoặc admin (case-insensitive)
        const role = (user.role || "").toString().toLowerCase();
        if (role !== "driver" && role !== "admin") {
          toast.error("Bạn không có quyền truy cập vào hệ thống Driver");
          return;
        }

        // Lưu vào Zustand store (tự động lưu vào localStorage)
        login({ token, user });

        toast.success("Đăng nhập thành công!");

        // Chuyển hướng đến dashboard
        setTimeout(() => {
          navigate("/", { replace: true });
        }, 500);
      }
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
      toast.error(
        error.response?.data?.message ||
          "Tên đăng nhập hoặc mật khẩu không đúng"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-green-500 to-green-600 flex items-center justify-center p-4">
      <Toaster position="top-right" />
      <div className="max-w-md w-full">
        {/* Logo và Tiêu đề */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-white p-4 rounded-full shadow-lg">
              <Bus size={48} className="text-green-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            SmartBus Driver
          </h1>
          <p className="text-green-100">Hệ thống Quản lý cho Tài xế</p>
        </div>

        {/* Form đăng nhập */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Đăng nhập
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tên đăng nhập */}
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
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Nhập tên đăng nhập"
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Mật khẩu */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={20} className="text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Nhập mật khẩu"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff
                      size={20}
                      className="text-gray-400 hover:text-gray-600"
                    />
                  ) : (
                    <Eye
                      size={20}
                      className="text-gray-400 hover:text-gray-600"
                    />
                  )}
                </button>
              </div>
            </div>

            {/* Nút đăng nhập */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 bg-green-600 text-white rounded-lg font-semibold
                ${
                  loading
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-green-700 active:bg-green-800"
                }
                transition-colors duration-200 shadow-lg`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Đang đăng nhập...
                </span>
              ) : (
                "Đăng nhập"
              )}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm text-green-800 font-medium mb-2">
              📝 Thông tin đăng nhập Driver:
            </p>
            <div className="text-sm text-green-700 space-y-1">
              <p>
                • Tên đăng nhập:{" "}
                <span className="font-mono font-bold">driver1</span>
              </p>
              <p>
                • Mật khẩu: <span className="font-mono font-bold">123456</span>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-green-100 text-sm mt-6">
          © 2025 SmartBus. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
