// frontend/admin-dashboard/src/pages/Auth/ParentDashboardPage.jsx

import React, { useEffect, useState } from 'react';
import apiServices from '../../api/apiServices';
import useAuthStore from '../../hooks/useAuthStore';

const ParentDashboardPage = () => {
    const { user } = useAuthStore();
    const [parentData, setParentData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Gọi API /parents/me đã được bảo vệ
                const response = await apiServices.getParentSelfDetail();
                setParentData(response.data);
            } catch (err) {
                console.error("Failed to fetch parent data:", err);
                const errorMessage = err.response?.data?.message || 'Không thể tải dữ liệu phụ huynh.';
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <div style={{ textAlign: 'center' }}>Đang tải thông tin...</div>;
    if (error) return <div style={{ color: 'red', textAlign: 'center' }}>Lỗi: {error}</div>;
    if (!parentData) return <div style={{ textAlign: 'center' }}>Không tìm thấy dữ liệu.</div>;

    return (
        <div style={styles.container}>
            <h2 style={styles.header}>Chào mừng, {parentData.fullName}!</h2>
            <p style={styles.info}>ID tài khoản: {user.id}</p>
            <p style={styles.info}>Liên hệ: {parentData.phone}</p>

            <h3 style={styles.subHeader}>Danh sách con cái</h3>
            {parentData.Students && parentData.Students.length > 0 ? (
                parentData.Students.map((student) => (
                    <StudentCard key={student.id} student={student} />
                ))
            ) : (
                <p>Bạn chưa có học sinh nào được liên kết.</p>
            )}
        </div>
    );
};

// Component con hiển thị thông tin học sinh
const StudentCard = ({ student }) => (
    <div style={styles.card}>
        <h4>{student.name}</h4>
        <p>Lớp: <strong>{student.className}</strong> (Khối {student.grade})</p>
        <p>Trạng thái: <span style={styles.status(student.status)}>{student.status}</span></p>
        <p>Mã Bus: {student.assignedBusId || 'Chưa gán'}</p>
    </div>
);

const styles = {
    container: { maxWidth: '900px', margin: '0 auto', padding: '20px' },
    header: { color: '#007bff', borderBottom: '2px solid #007bff', paddingBottom: '10px' },
    subHeader: { marginTop: '30px', borderBottom: '1px solid #ccc', paddingBottom: '5px' },
    info: { fontSize: '16px', color: '#555' },
    card: {
        backgroundColor: '#fff',
        borderLeft: '5px solid #ffc107',
        padding: '15px',
        margin: '15px 0',
        borderRadius: '5px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    status: (status) => ({
        fontWeight: 'bold',
        color: status === 'IN_BUS' ? '#28a745' : '#dc3545',
    })
};

export default ParentDashboardPage;