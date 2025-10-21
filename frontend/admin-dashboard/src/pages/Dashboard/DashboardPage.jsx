// frontend/admin-dashboard/src/pages/Dashboard/DashboardPage.jsx

import React, { useEffect, useState } from 'react';
import apiServices from '../../api/apiServices';
import TrackingMap from '../../components/Map/TrackingMap'; 
// Giả định có các icon
// import { FaBus, FaUsers, FaRoad } from 'react-icons/fa'; 

const DashboardPage = () => {
    const [summary, setSummary] = useState({ 
        totalBuses: 0, 
        totalStudents: 0, 
        activeRoutes: 0,
        runningBuses: 0,
    });
    const [liveLocations, setLiveLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 1. Fetch Dữ liệu Tổng hợp (Summary Metrics)
    useEffect(() => {
        const fetchSummaryData = async () => {
            try {
                // Giả định API summary tồn tại và trả về data
                const summaryRes = await apiServices.getSummaryMetrics(); 
                setSummary(summaryRes.data);

                // 2. Fetch Vị trí Trực tiếp (cho Bản đồ)
                const locationRes = await apiServices.getLiveBusLocations();
                setLiveLocations(locationRes.data); 
            } catch (err) {
                console.error("Dashboard data fetch failed:", err);
                const errorMessage = err.response?.data?.message || 'Không thể tải dữ liệu tổng quan.';
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        fetchSummaryData();
        
        // Polling (Tự động cập nhật vị trí sau mỗi 10 giây)
        const intervalId = setInterval(async () => {
            try {
                const locationRes = await apiServices.getLiveBusLocations();
                setLiveLocations(locationRes.data);
            } catch (e) {
                console.error("Live location update failed:", e);
            }
        }, 10000); // Cập nhật mỗi 10 giây

        return () => clearInterval(intervalId); // Cleanup khi component unmount
    }, []);

    // ------------------------------------------------------------------
    // HIỂN THỊ TRẠNG THÁI
    // ------------------------------------------------------------------

    if (loading) {
        return <div style={{ textAlign: 'center', marginTop: '50px' }}>Đang tải Dashboard...</div>;
    }

    if (error) {
        return <div style={{ color: 'red', textAlign: 'center', marginTop: '50px' }}>Lỗi: {error}</div>;
    }

    // ------------------------------------------------------------------
    // HIỂN THỊ CHÍNH
    // ------------------------------------------------------------------
    return (
        <div className="dashboard-page" style={styles.container}>
            <h2>Bảng Điều Khiển Quản Trị</h2>
            
            {/* Thẻ Chỉ số (KPI Cards) */}
            <div style={styles.kpiGrid}>
                <KpiCard 
                    title="Tổng số Xe buýt" 
                    value={summary.totalBuses} 
                    icon="Bus" 
                    color="#007bff" 
                />
                <KpiCard 
                    title="Xe đang hoạt động" 
                    value={summary.runningBuses} 
                    icon="ActiveBus" 
                    color="#28a745" 
                />
                <KpiCard 
                    title="Tổng số Học sinh" 
                    value={summary.totalStudents} 
                    icon="Student" 
                    color="#ffc107" 
                />
                <KpiCard 
                    title="Tuyến đường đang chạy" 
                    value={summary.activeRoutes} 
                    icon="Route" 
                    color="#dc3545" 
                />
            </div>

            {/* Bản đồ Theo dõi Xe buýt Trực tiếp */}
            <div style={styles.mapSection}>
                <h3>Theo dõi Xe buýt Trực tiếp</h3>
                <TrackingMap busLocations={liveLocations} />
            </div>
        </div>
    );
};

// Component con cho KPI (Chỉ để minh họa)
const KpiCard = ({ title, value, color, icon }) => (
    <div style={{ ...styles.kpiCard, borderLeft: `5px solid ${color}` }}>
        <p style={styles.kpiTitle}>{title}</p>
        <h3 style={{ ...styles.kpiValue, color }}>{value}</h3>
        {/* <FaBus color={color} size={30} /> */}
    </div>
);

// ------------------------------------------------------------------
// STYLES TỐI THIỂU
// ------------------------------------------------------------------
const styles = {
    container: { padding: '20px' },
    kpiGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '30px',
    },
    kpiCard: {
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100px',
    },
    kpiTitle: {
        margin: 0,
        fontSize: '14px',
        color: '#6c757d',
    },
    kpiValue: {
        margin: '5px 0 0 0',
        fontSize: '32px',
    },
    mapSection: {
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        height: '600px', // Đặt chiều cao cố định cho bản đồ
    },
};

export default DashboardPage;