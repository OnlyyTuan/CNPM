// frontend/src/components/Auth/ProtectedRoute.jsx
// Component bảo vệ routes chỉ cho phép user đã đăng nhập

import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  // Kiểm tra token trong localStorage
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  
  if (!token || !userStr) {
    // Chưa đăng nhập -> chuyển về trang login
    return <Navigate to="/login/admin" replace />;
  }

  try {
    const user = JSON.parse(userStr);
    
    // Kiểm tra role admin
    if (user.role !== 'admin') {
      // Không phải admin -> không cho truy cập
      localStorage.clear();
      return <Navigate to="/login/admin" replace />;
    }

    // Đã đăng nhập và là admin -> cho phép truy cập
    return children;
  } catch (error) {
    // Lỗi parse user data -> xóa và đăng nhập lại
    localStorage.clear();
    return <Navigate to="/login/admin" replace />;
  }
};

export default ProtectedRoute;
