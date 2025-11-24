import { useState, useEffect } from 'react';
import axios from 'axios';
import RealTimeLeafletMap from './RealTimeLeafletMap';
import './ParentGPSTracking.css';

function ParentGPSTracking({ studentId = 'S1' }) {
  const [busLocation, setBusLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [distance, setDistance] = useState(null);

  // Tính khoảng cách giữa 2 điểm GPS (công thức Haversine)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Bán kính Trái Đất (km)
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Fetch vị trí xe bus của học sinh
  const fetchBusLocation = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/gps/students/${studentId}/bus-location`
      );
      const data = response.data;
      setBusLocation(data);

      // Tính khoảng cách từ xe đến điểm đón
      if (
        data.current_latitude &&
        data.current_longitude &&
        data.pickup_latitude &&
        data.pickup_longitude
      ) {
        const dist = calculateDistance(
          data.current_latitude,
          data.current_longitude,
          data.pickup_latitude,
          data.pickup_longitude
        );
        setDistance(dist.toFixed(2));
      }

      setError(null);
    } catch (err) {
      console.error('Error fetching bus location:', err);
      setError('Không thể tải vị trí xe bus');
    } finally {
      setLoading(false);
    }
  };

  // Auto refresh mỗi 10 giây
  useEffect(() => {
    fetchBusLocation();

    if (autoRefresh) {
      const interval = setInterval(fetchBusLocation, 10000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, studentId]);

  const getStatusText = (status) => {
    const statusMap = {
      WAITING: 'Đang chờ',
      PICKED_UP: 'Đã lên xe',
      ABSENT: 'Vắng mặt',
      ON_BUS: 'Trên xe',
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    const colorMap = {
      WAITING: '#ffc107',
      PICKED_UP: '#28a745',
      ON_BUS: '#28a745',
      ABSENT: '#dc3545',
    };
    return colorMap[status] || '#6c757d';
  };

  const getEstimatedArrival = () => {
    if (!distance || !busLocation?.speed) {
      return 'Đang tính toán...';
    }
    const speed = parseFloat(busLocation.speed);
    if (speed === 0) {
      return 'Xe đang dừng';
    }
    const timeInHours = distance / speed;
    const timeInMinutes = Math.round(timeInHours * 60);
    return `Khoảng ${timeInMinutes} phút`;
  };

  if (loading) {
    return <div className="parent-loading">Đang tải thông tin xe bus...</div>;
  }

  if (error) {
    return <div className="parent-error">{error}</div>;
  }

  if (!busLocation) {
    return (
      <div className="parent-error">Không tìm thấy thông tin xe bus của học sinh</div>
    );
  }

  return (
    <div className="parent-gps-container">
      {/* Header */}
      <div className="parent-header">
        <div className="header-left">
          <h1>🚌 Theo dõi xe đưa đón</h1>
          <p className="student-name">Học sinh: {busLocation.student_name}</p>
        </div>
        <div className="header-right">
          <label className="auto-refresh">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            Tự động cập nhật (10s)
          </label>
          <button className="refresh-btn" onClick={fetchBusLocation}>
            🔄 Làm mới
          </button>
        </div>
      </div>

      {/* Status Banner */}
      <div className="status-banner">
        <div className="status-item">
          <span className="status-label">Trạng thái học sinh:</span>
          <span
            className="status-value"
            style={{ color: getStatusColor(busLocation.student_status) }}
          >
            {getStatusText(busLocation.student_status)}
          </span>
        </div>
        <div className="status-item">
          <span className="status-label">Trạng thái xe:</span>
          <span
            className="status-value"
            style={{ color: getStatusColor(busLocation.bus_status) }}
          >
            {busLocation.bus_status}
          </span>
        </div>
        <div className="status-item">
          <span className="status-label">Vận tốc xe:</span>
          <span className="status-value">{busLocation.speed || 0} km/h</span>
        </div>
      </div>

      {/* Google Maps Display */}
      <div className="map-section">
        <RealTimeGoogleMap
          busLocation={busLocation.current_latitude && busLocation.current_longitude ? {
            latitude: busLocation.current_latitude,
            longitude: busLocation.current_longitude,
            bus_id: busLocation.bus_id,
            current_location_name: busLocation.current_location_name,
            speed: busLocation.speed,
            bus_status: busLocation.bus_status,
            driver_name: busLocation.driver_name
          } : null}
          pickupLocation={busLocation.pickup_latitude && busLocation.pickup_longitude ? {
            latitude: busLocation.pickup_latitude,
            longitude: busLocation.pickup_longitude,
            pickup_location_name: busLocation.pickup_location_name,
            pickup_time: busLocation.pickup_time
          } : null}
          dropoffLocation={busLocation.dropoff_latitude && busLocation.dropoff_longitude ? {
            latitude: busLocation.dropoff_latitude,
            longitude: busLocation.dropoff_longitude,
            dropoff_location_name: busLocation.dropoff_location_name
          } : null}
          showRoute={false}
          height="500px"
        />
      </div>

      {/* Information Cards */}
      <div className="info-cards">
        {/* Pickup Location */}
        <div className="info-card pickup-card">
          <h3>📍 Điểm đón</h3>
          <div className="card-content">
            <p className="location-name">{busLocation.pickup_location_name}</p>
            <p className="location-time">⏰ Giờ đón: {busLocation.pickup_time || 'N/A'}</p>
            <div className="distance-info">
              <p className="distance-label">Khoảng cách từ xe đến điểm đón:</p>
              <p className="distance-value">{distance ? `${distance} km` : 'Đang tính...'}</p>
              <p className="eta">Thời gian dự kiến: {getEstimatedArrival()}</p>
            </div>
          </div>
        </div>

        {/* Dropoff Location */}
        <div className="info-card dropoff-card">
          <h3>🏫 Điểm trả</h3>
          <div className="card-content">
            <p className="location-name">{busLocation.dropoff_location_name}</p>
            <p className="info-detail">Địa điểm: Trường học</p>
          </div>
        </div>

        {/* Bus Info */}
        <div className="info-card bus-card">
          <h3>🚌 Thông tin xe</h3>
          <div className="card-content">
            <p>
              <strong>Mã xe:</strong> {busLocation.bus_id}
            </p>
            <p>
              <strong>Tuyến:</strong> {busLocation.route_name || 'N/A'}
            </p>
            <p>
              <strong>Tài xế:</strong> {busLocation.driver_name || 'N/A'}
            </p>
            <p>
              <strong>SĐT tài xế:</strong>{' '}
              <a href={`tel:${busLocation.driver_phone}`}>{busLocation.driver_phone}</a>
            </p>
          </div>
        </div>

        {/* Student Info */}
        <div className="info-card student-card">
          <h3>👦 Thông tin học sinh</h3>
          <div className="card-content">
            <p>
              <strong>Họ tên:</strong> {busLocation.student_name}
            </p>
            <p>
              <strong>Lớp:</strong> {busLocation.class}
            </p>
            <p>
              <strong>Trạng thái:</strong>{' '}
              <span style={{ color: getStatusColor(busLocation.student_status) }}>
                {getStatusText(busLocation.student_status)}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Alert Section */}
      {distance && parseFloat(distance) < 2 && (
        <div className="alert-banner">
          <span className="alert-icon">🔔</span>
          <span className="alert-text">
            Xe bus sắp đến điểm đón! Vui lòng chuẩn bị.
          </span>
        </div>
      )}

      {/* Last Update */}
      <div className="last-update">
        <p>
          ⏱️ Cập nhật lần cuối:{' '}
          {busLocation.lastUpdate
            ? new Date(busLocation.lastUpdate).toLocaleString('vi-VN')
            : 'N/A'}
        </p>
      </div>
    </div>
  );
}

export default ParentGPSTracking;S