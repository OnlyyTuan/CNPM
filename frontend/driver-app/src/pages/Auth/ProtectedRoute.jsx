// frontend/driver-app/src/pages/Auth/ProtectedRoute.jsx

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../../hooks/useAuthStore';
import Layout from '../../components/Layout/Layout'; // Path đúng đến components/Layout

/**
 * Component bảo vệ tuyến đường (Route Guard)
 * @param {string[]} allowedRoles - Mảng các vai trò được phép truy cập (ví dụ: ['admin', 'driver'])
 */
const ProtectedRoute = ({ allowedRoles }) => {
    const { isLoggedIn, role } = useAuthStore();
    
    // 1. Nếu chưa đăng nhập, chuyển hướng đến trang Đăng nhập
    if (!isLoggedIn) {
        return <Navigate to="/login" replace />;
    }

    // 2. Nếu đã đăng nhập nhưng vai trò không được phép
    if (allowedRoles && !allowedRoles.includes(role)) {
        // Chuyển hướng đến trang lỗi 403 (Unauthorized)
        return <Navigate to="/unauthorized" replace />;
    }

    // 3. Nếu đã đăng nhập và có vai trò hợp lệ
    // Trả về Layout bao bọc nội dung (Outlet)
    return (
        <Layout>
            <Outlet />
        </Layout>
    );
};

export default ProtectedRoute;