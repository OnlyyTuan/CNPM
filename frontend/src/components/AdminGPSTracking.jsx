import { useState, useEffect } from 'react';
import axios from 'axios';
import RealTimeLeafletMap from './RealTimeLeafletMap';
import './AdminGPSTracking.css';

function AdminGPSTracking() {
  const [buses, setBuses] = useState([]);
  const [selectedBus, setSelectedBus] = useState(null);
  const [routeStops, setRouteStops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch tất cả vị trí xe bus
  const fetchBusLocations = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/gps/buses/locations');
      setBuses(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching bus locations:', err);
      setError('Không thể tải vị trí xe bus');
    } finally {
      setLoading(false);
    }
  };

  // Fetch chi tiết một xe bus
  const fetchBusDetail = async (busId) => {
    try {
      const response = await axios.get(`http://localhost:3000/api/gps/buses/${busId}/location`);
      setSelectedBus(response.data);
      
      // Fetch route stops nếu có route
      if (response.data.route_id) {
        const stopsResponse = await axios.get(
          `http://localhost:3000/api/gps/routes/${response.data.route_id}/stops`
        );
        setRouteStops(stopsResponse.data);
      }
    } catch (err) {
      console.error('Error fetching bus detail:', err);
    }
  };

  // Auto refresh mỗi 5 giây
  useEffect(() => {
    fetchBusLocations();

    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchBusLocations();
        if (selectedBus) {
          fetchBusDetail(selectedBus.bus_id);
        }
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [autoRefresh, selectedBus]);

  const handleBusClick = (bus) => {
    setSelectedBus(bus);
    fetchBusDetail(bus.bus_id);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return '#28a745';
      case 'MAINTENANCE': return '#ffc107';
      case 'INACTIVE': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString('vi-VN');
  };

  if (loading) {
    return <div className="loading">Đang tải dữ liệu GPS...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="admin-gps-container">
      <div className="header">
        <h1>🚌 Giám Sát GPS Xe Bus</h1>
        <div className="header-controls">
          <label>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            Tự động làm mới (5s)
          </label>
          <button onClick={fetchBusLocations}>🔄 Làm mới</button>
        </div>
      </div>

      <div className="content">
        {/* Danh sách xe bus */}
        <div className="bus-list">
          <h2>Danh sách xe ({buses.length})</h2>
          {buses.length === 0 ? (
            <p>Không có xe bus nào đang hoạt động</p>
          ) : (
            buses.map((bus) => (
              <div
                key={bus.bus_id}
                className={`bus-item ${selectedBus?.bus_id === bus.bus_id ? 'active' : ''}`}
                onClick={() => handleBusClick(bus)}
              >
                <div className="bus-header">
                  <h3>🚌 {bus.bus_id}</h3>
                  <span 
                    className="status-badge" 
                    style={{ backgroundColor: getStatusColor(bus.status) }}
                  >
                    {bus.status}
                  </span>
                </div>
                <div className="bus-info">
                  <p><strong>Tài xế:</strong> {bus.driver_name || 'N/A'}</p>
                  <p><strong>Tuyến:</strong> {bus.route_name || 'N/A'}</p>
                  <p><strong>Vận tốc:</strong> {bus.speed || 0} km/h</p>
                  <p><strong>Cập nhật:</strong> {formatTime(bus.lastUpdate)}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Chi tiết xe bus */}
        <div className="bus-detail">
          {selectedBus ? (
            <>
              <h2>Chi tiết xe {selectedBus.bus_id}</h2>
              
              {/* Google Maps */}
              <div className="map-container">
                <RealTimeGoogleMap
                  busLocation={{
                    latitude: selectedBus.latitude,
                    longitude: selectedBus.longitude,
                    bus_id: selectedBus.bus_id,
                    current_location_name: selectedBus.location_name,
                    speed: selectedBus.speed,
                    bus_status: selectedBus.status,
                    driver_name: selectedBus.driver_name
                  }}
                  routeStops={routeStops}
                  showRoute={true}
                  height="500px"
                />
              </div>

              {/* Thông tin chi tiết */}
              <div className="detail-info">
                <div className="info-section">
                  <h3>Thông tin xe</h3>
                  <p><strong>Sức chứa:</strong> {selectedBus.capacity || 'N/A'} học sinh</p>
                  <p><strong>Vị trí hiện tại:</strong> {selectedBus.location_name || 'Đang di chuyển'}</p>
                  <p><strong>Địa chỉ:</strong> {selectedBus.address || 'N/A'}</p>
                  <p><strong>Vận tốc:</strong> {selectedBus.speed || 0} km/h</p>
                </div>

                <div className="info-section">
                  <h3>Thông tin tài xế</h3>
                  <p><strong>Họ tên:</strong> {selectedBus.driver_name || 'N/A'}</p>
                  <p><strong>Điện thoại:</strong> {selectedBus.driver_phone || 'N/A'}</p>
                </div>

                <div className="info-section">
                  <h3>Thông tin tuyến</h3>
                  <p><strong>Tên tuyến:</strong> {selectedBus.route_name || 'N/A'}</p>
                  <p><strong>Giờ bắt đầu:</strong> {selectedBus.startTime || 'N/A'}</p>
                  <p><strong>Giờ kết thúc:</strong> {selectedBus.endTime || 'N/A'}</p>
                </div>
              </div>

              {/* Điểm dừng trên tuyến */}
              {routeStops.length > 0 && (
                <div className="route-stops">
                  <h3>Điểm dừng trên tuyến ({routeStops.length})</h3>
                  <ul>
                    {routeStops.map((stop) => (
                      <li key={stop.location_id}>
                        <strong>{stop.stop_order}.</strong> {stop.name}
                        <span className="stop-time">
                          {stop.estimatedTime || 'N/A'}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <div className="no-selection">
              <p>👈 Chọn một xe bus để xem chi tiết</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminGPSTracking;