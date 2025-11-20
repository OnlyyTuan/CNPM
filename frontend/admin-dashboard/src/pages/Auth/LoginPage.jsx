// frontend/admin-dashboard/src/pages/Auth/LoginPage.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../hooks/useAuthStore';
import apiServices from '../../api/apiServices';

const LoginPage = () => {
    // Lấy action 'login' từ store
    const loginAction = useAuthStore((state) => state.login);
    const navigate = useNavigate();
    
    const [credentials, setCredentials] = useState({
        username: '',
        password: '',
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    // Xử lý thay đổi input
    const handleChange = (e) => {
        setCredentials({
            ...credentials,
            [e.target.name]: e.target.value,
        });
    };

    // Xử lý submit form
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            // 1. Gọi API đăng nhập
            const response = await apiServices.login(credentials);
            const { token, user } = response.data;
            
            // 2. Lưu trạng thái vào Store và localStorage
            loginAction({ token, user });

            // 3. Chuyển hướng người dùng đến trang Dashboard hoặc trang theo Role
            if (user.role === 'admin') {
                navigate('/'); // Chuyển đến trang Dashboard chính
            } else if (user.role === 'driver') {
                navigate('/driver/dashboard'); // Ví dụ: Trang dành cho Tài xế
            } else {
                navigate('/parent/dashboard'); // Ví dụ: Trang dành cho Phụ huynh
            }

        } catch (err) {
            console.error('Login Failed:', err);
            // Hiển thị thông báo lỗi từ server (ví dụ: 'Tên đăng nhập hoặc mật khẩu không đúng.')
            const errorMessage = err.response?.data?.message || 'Đã xảy ra lỗi trong quá trình đăng nhập.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.formBox}>
                <h2 style={styles.header}>Đăng nhập Quản lý Xe buýt</h2>
                
                {error && <p style={styles.error}>{error}</p>}

                <form onSubmit={handleSubmit}>
                    <div style={styles.formGroup}>
                        <label htmlFor="username" style={styles.label}>Tên đăng nhập</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={credentials.username}
                            onChange={handleChange}
                            required
                            style={styles.input}
                        />
                    </div>
                    <div style={styles.formGroup}>
                        <label htmlFor="password" style={styles.label}>Mật khẩu</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={credentials.password}
                            onChange={handleChange}
                            required
                            style={styles.input}
                        />
                    </div>
                    <button type="submit" style={styles.button} disabled={loading}>
                        {loading ? 'Đang xử lý...' : 'Đăng nhập'}
                    </button>
                </form>
            </div>
        </div>
    );
};

// CSS Tối thiểu (Để bạn dễ hình dung)
const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f4f7f9',
    },
    formBox: {
        backgroundColor: '#fff',
        padding: '40px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '400px',
    },
    header: {
        textAlign: 'center',
        marginBottom: '30px',
        color: '#333',
    },
    formGroup: {
        marginBottom: '20px',
    },
    label: {
        display: 'block',
        marginBottom: '8px',
        fontWeight: 'bold',
        color: '#555',
    },
    input: {
        width: '100%',
        padding: '10px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        boxSizing: 'border-box',
    },
    button: {
        width: '100%',
        padding: '12px',
        backgroundColor: '#007bff',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: 'bold',
        marginTop: '10px',
    },
    error: {
        color: 'red',
        backgroundColor: '#ffe3e3',
        padding: '10px',
        borderRadius: '4px',
        marginBottom: '15px',
        textAlign: 'center',
    }
};

export default LoginPage;