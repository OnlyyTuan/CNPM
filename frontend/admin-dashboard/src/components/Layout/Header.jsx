// frontend/admin-dashboard/src/components/Layout/Header.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../hooks/useAuthStore';
// import { FaUserCircle, FaSignOutAlt } from 'react-icons/fa'; // Icon

const Header = () => {
    const { user, role, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout(); // Xóa trạng thái Auth
        navigate('/login'); // Chuyển hướng đến trang đăng nhập
    };

    return (
        <header style={styles.header}>
            <div style={styles.leftContent}>
                {/* Có thể thêm thanh tìm kiếm hoặc Breadcrumb ở đây */}
                <h3 style={{ margin: 0, color: '#343a40' }}>Dashboard</h3>
            </div>
            
            <div style={styles.rightContent}>
                <div style={styles.userInfo}>
                    {/* <FaUserCircle size={24} style={{ marginRight: '10px', color: '#6c757d' }} /> */}
                    <span style={styles.username}>{user?.username || 'Admin'}</span>
                    <span style={styles.roleBadge}>{role.toUpperCase()}</span>
                </div>
                
                <button 
                    onClick={handleLogout} 
                    style={styles.logoutButton}
                    title="Đăng xuất"
                >
                    {/* <FaSignOutAlt style={{ marginRight: '5px' }} /> */}
                    Đăng xuất
                </button>
            </div>
        </header>
    );
};

const styles = {
    header: {
        height: '60px',
        backgroundColor: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        borderBottom: '1px solid #dee2e6',
        zIndex: 10,
    },
    leftContent: {
        // ...
    },
    rightContent: {
        display: 'flex',
        alignItems: 'center',
    },
    userInfo: {
        display: 'flex',
        alignItems: 'center',
        marginRight: '20px',
    },
    username: {
        fontWeight: '600',
        color: '#343a40',
        marginRight: '10px',
    },
    roleBadge: {
        backgroundColor: '#007bff',
        color: 'white',
        padding: '4px 8px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: 'bold',
    },
    logoutButton: {
        backgroundColor: '#dc3545', // Màu đỏ
        color: 'white',
        border: 'none',
        padding: '8px 15px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontWeight: '500',
        transition: 'background-color 0.3s',
    }
};

export default Header;