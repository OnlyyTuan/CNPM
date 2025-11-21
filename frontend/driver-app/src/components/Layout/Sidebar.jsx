// frontend/driver-app/src/components/Layout/Sidebar.jsx
// Sidebar cho Driver App - Bỏ menu Tài khoản và Phụ huynh

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
// import { FaTachometerAlt, FaBus, FaUserTie, FaUsers, FaMapMarkedAlt } from 'react-icons/fa'; // Icon

const navItems = [
    { name: 'Dashboard', path: '/', icon: 'FaTachometerAlt' },
    { name: 'Xe buýt', path: '/buses', icon: 'FaBus' },
    { name: 'Tài xế', path: '/drivers', icon: 'FaUserTie' },
    { name: 'Học sinh', path: '/students', icon: 'FaUsers' },
    { name: 'Tuyến đường', path: '/routes', icon: 'FaMapMarkedAlt' },
];

const Sidebar = () => {
    const location = useLocation();

    return (
        <div style={styles.sidebar}>
            <div style={styles.logoContainer}>
                <h1 style={styles.logoText}>SmartSchoolBus</h1>
            </div>
            <nav>
                {navItems.map((item) => (
                    <Link
                        key={item.name}
                        to={item.path}
                        style={{
                            ...styles.navLink,
                            ...(location.pathname === item.path ? styles.activeNavLink : {})
                        }}
                    >
                        {/* {React.createElement(item.icon, { style: { marginRight: '10px' } })} */}
                        {item.name}
                    </Link>
                ))}
            </nav>
        </div>
    );
};

const styles = {
    sidebar: {
        width: '250px',
        minHeight: '100vh',
        backgroundColor: '#343a40', // Màu tối
        color: 'white',
        padding: '20px 0',
        boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
        position: 'sticky',
        top: 0,
    },
    logoContainer: {
        padding: '0 20px 30px 20px',
        borderBottom: '1px solid #495057',
    },
    logoText: {
        fontSize: '24px',
        margin: 0,
        textAlign: 'center',
        fontWeight: '700',
        color: '#ffc107', // Màu vàng nổi bật
    },
    navLink: {
        display: 'flex',
        alignItems: 'center',
        padding: '12px 20px',
        textDecoration: 'none',
        color: '#adb5bd',
        fontSize: '16px',
        transition: 'background-color 0.3s, color 0.3s',
    },
    activeNavLink: {
        backgroundColor: '#495057',
        color: 'white',
        borderLeft: '5px solid #007bff', // Dấu hiệu active
        paddingLeft: '15px',
    }
};

export default Sidebar;