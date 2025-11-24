import { useState, useEffect } from 'react';
import axios from 'axios';
import RealTimeLeafletMap from './RealTimeLeafletMap';
import './DriverGPSTracking.css';

function DriverGPSTracking({ driverId = 'D1' }) {
  const [busInfo, setBusInfo] = useState(null);
  const [students, setStudents] = useState([]);
  const [routeStops, setRouteStops] = useState([]);
  const [currentPosition, setCurrentPosition] = useState(null);
  const [tracking, setTracking] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updateStatus, setUpdateStatus] = useState('');

  // Fetch thông tin xe bus và tài xế
  const fetchBusInfo = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/gps/drivers/${driverId}/bus`
      );
      setBusInfo(response.data);

      // Fetch danh sách học sinh trên xe
      if (response.data.bus_id) {
        const studentsResponse = await axios.get(
          `http://localhost:3000/api/gps/buses/${response.data.bus_id}/students`
        );
        setStudents(studentsResponse.data);

        // Fetch route stops
        if (response.data.route_id) {
          const stopsResponse = await axios.get(
            `http://localhost:3000/api/gps/routes/${response.data.route_id}/stops`
          );
          setRouteStops(stopsResponse.data);
        }
      }

      setError(null);
    } catch (err) {
      console.error('Error fetching bus info:', err);
      setError('Không thể tải thông tin xe bus');
    } finally {
      setLoading(false);
    }
  };

  // Lấy vị trí GPS từ trình duyệt
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Trình duyệt không hỗ trợ GPS');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const pos = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          speed: position.coords.speed || 0,
        };
        setCurrentPosition(pos);
      },
      (error) => {
        console.error('Error getting location:', error);
        setError('Không thể lấy vị trí GPS');
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  };

  // Cập nhật vị trí lên server
  const updateLocationToServer = async (position) => {
    if (!busInfo?.bus_id) return;

    try {
      setUpdateStatus('Đang cập nhật...');
      await axios.put(
        `http://localhost:3000/api/gps/buses/${busInfo.bus_id}/update-location`,
        {
          latitude: position.latitude,
          longitude: position.longitude,
          speed: position.speed,
        }
      );
      setUpdateStatus('✓ Đã cập nhật');
      setTimeout(() => setUpdateStatus(''), 2000);
    } catch (err) {
      console.error('Error updating location:', err);
      setUpdateStatus('✗ Lỗi cập nhật');
    }
  };

  // Bật/tắt theo dõi GPS tự động
  const toggleTracking = () => {
    setTracking(!tracking);
  };

  // Auto tracking
  useEffect(() => {
    if (tracking) {
      const interval = setInterval(() => {
        getCurrentLocation();
      }, 10000); // Cập nhật mỗi 10 giây

      return () => clearInterval(interval);
    }
  }, [tracking]);

  // Cập nhật lên server khi có vị trí mới
  useEffect(() => {
    if (currentPosition && tracking) {
      updateLocationToServer(currentPosition);
    }
  }, [currentPosition]);

  // Load initial data
  useEffect(() => {
    fetchBusInfo();
    getCurrentLocation();
  }, [driverId]);

  const getStudentStatusColor = (status) => {
    const colors = {
      WAITING: '#ffc107',
      PICKED_UP: '#28a745',
      ON_BUS: '#28a745',
      ABSENT: '#dc3545',
    };
    return colors[status] || '#6c757d';
  };

  if (loading) {
    return <div className="driver-loading">Đang tải thông tin...</div>;
  }

  if (error) {
    return <div className="driver-error">{error}</div>;
  }

  if (!busInfo?.bus_id) {
    return (
      <div className="driver-error">
        Tài xế chưa được phân công xe bus
      </div>
    );
  }

  return (
    <div className="driver-gps-container">
      {/* Header */}
      <div className="driver-header">
        <div className="driver-info">
          <h1>🚗 Giao diện Tài xế</h1>
          <p className="driver-name">Xin chào, {busInfo.driver_name}</p>
        </div>
        <div className="tracking-control">
          <button
            className={`tracking-btn ${tracking ? 'active' : ''}`}
            onClick={toggleTracking}
          >
            {tracking ? '⏸️ Tạm dừng GPS' : '▶️ Bật theo dõi GPS'}
          </button>
          {updateStatus && <span className="update-status">{updateStatus}</span>}
        </div>
      </div>

      {/* Bus Status Card */}
      <div className="bus-status-card">
        <h2>🚌 Thông tin xe: {busInfo.bus_id}</h2>
        <div className="bus-stats">
          <div className="stat-item">
            <span className="stat-label">Tuyến đường</span>
            <span className="stat-value">{busInfo.route_name || 'N/A'}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Sức chứa</span>
            <span className="stat-value">{busInfo.capacity} HS</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Vận tốc</span>
            <span className="stat-value">{currentPosition?.speed?.toFixed(1) || 0} km/h</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Trạng thái</span>
            <span className="stat-value status-active">{busInfo.status}</span>
          </div>
        </div>
      </div>

      {/* Current Location */}
      <div className="current-location-card">
        <h3>📍 Vị trí hiện tại</h3>
        {currentPosition ? (
          <div className="location-details">
            <p>
              <strong>Vĩ độ:</strong> {currentPosition.latitude.toFixed(6)}
            </p>
            <p>
              <strong>Kinh độ:</strong> {currentPosition.longitude.toFixed(6)}
            </p>
            <p>
              <strong>Tốc độ:</strong> {currentPosition.speed?.toFixed(1) || 0} km/h
            </p>
            <button className="manual-update-btn" onClick={getCurrentLocation}>
              🔄 Cập nhật thủ công
            </button>
          </div>
        ) : (
          <p className="no-location">Đang lấy vị trí GPS...</p>
        )}
      </div>

      {/* Google Maps Navigation */}
      <div className="driver-map-section">
        <RealTimeGoogleMap
          busLocation={currentPosition ? {
            latitude: currentPosition.latitude,
            longitude: currentPosition.longitude,
            bus_id: busInfo.bus_id,
            speed: currentPosition.speed,
            bus_status: busInfo.status
          } : null}
          routeStops={routeStops}
          students={students}
          showRoute={true}
          height="450px"
        />
      </div>

      {/* Route Stops */}
      {routeStops.length > 0 && (
        <div className="route-stops-card">
          <h3>🛑 Điểm dừng trên tuyến ({routeStops.length})</h3>
          <div className="stops-list">
            {routeStops.map((stop, index) => (
              <div key={stop.location_id} className="stop-item">
                <div className="stop-number">{stop.stop_order}</div>
                <div className="stop-details">
                  <p className="stop-name">{stop.name}</p>
                  <p className="stop-address">{stop.address}</p>
                  <p className="stop-time">⏰ {stop.estimatedTime || 'N/A'}</p>
                </div>
                <div className="stop-type">{stop.type}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Students List */}
      <div className="students-card">
        <h3>👦 Danh sách học sinh ({students.length})</h3>
        {students.length === 0 ? (
          <p className="no-students">Chưa có học sinh nào được phân công</p>
        ) : (
          <div className="students-grid">
            {students.map((student) => (
              <div key={student.id} className="student-item">
                <div className="student-header">
                  <h4>{student.name}</h4>
                  <span
                    className="student-status-badge"
                    style={{ backgroundColor: getStudentStatusColor(student.status) }}
                  >
                    {student.status}
                  </span>
                </div>
                <div className="student-info">
                  <p>
                    <strong>Lớp:</strong> {student.class}
                  </p>
                  <p>
                    <strong>Điểm đón:</strong> {student.pickup_location}
                  </p>
                  <p>
                    <strong>Điểm trả:</strong> {student.dropoff_location}
                  </p>
                  <p>
                    <strong>Phụ huynh:</strong>{' '}
                    <a href={`tel:${student.parentContact}`}>{student.parentContact}</a>
                  </p>
                </div>
                <div className="student-actions">
                  <button className="action-btn pickup-btn">✓ Đã đón</button>
                  <button className="action-btn dropoff-btn">✓ Đã trả</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h3>⚡ Thao tác nhanh</h3>
        <div className="actions-grid">
          <button className="action-card">
            <span className="action-icon">📞</span>
            <span>Gọi điều độ</span>
          </button>
          <button className="action-card">
            <span className="action-icon">⚠️</span>
            <span>Báo sự cố</span>
          </button>
          <button className="action-card">
            <span className="action-icon">⛽</span>
            <span>Báo nhiên liệu</span>
          </button>
          <button className="action-card" onClick={fetchBusInfo}>
            <span className="action-icon">🔄</span>
            <span>Làm mới dữ liệu</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default DriverGPSTracking;