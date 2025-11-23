// frontend/src/pages/Live/LiveLocationPage.jsx
// Trang hiển thị vị trí xe buýt theo thời gian thực (polling mỗi 3 giây)

import React, { useEffect, useState, useRef } from 'react';
import { getLiveBusLocations } from '../../api/busApi';
import { getRouteWaypoints } from '../../api/routeApi';
import { getLocations } from '../../api/locationApi';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Sửa icon mặc định của Leaflet cho phù hợp Vite bundler    
const DefaultIcon = L.icon({
  iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).toString(),
  iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).toString(),
  shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).toString(),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Đổi màu/icon theo tốc độ
const speedToColor = (speed) => {
  if (speed == null) return '#6b7280'; // xám khi chưa rõ
  if (speed < 5) return '#ef4444';     // đỏ: gần như dừng
  if (speed < 20) return '#f59e0b';    // vàng: chậm
  if (speed < 40) return '#10b981';    // xanh lá: bình thường
  return '#3b82f6';                    // xanh dương: nhanh
};

const getSpeedIcon = (speed) => {
  const color = speedToColor(speed);
  // Icon xe bus với z-index cao để đè lên điểm dừng
  const html = `
    <span style="
      display:inline-block;
      width:22px; height:22px;
      background-color:${color};
      border-radius:3px;
      border:2px solid white;
      box-shadow:0 0 0 2px rgba(0,0,0,0.25);
      font-size:14px;
      font-weight:bold;
      color:white;
      text-align:center;
      line-height:18px;
      z-index:1000;
    ">🚌</span>`;
  return L.divIcon({ className: '', html, iconSize: [22, 22], iconAnchor: [11, 11], popupAnchor: [0, -12] });
};

// Component phụ để tự động fitBounds lần đầu
//Dùng để khi load danh sách tuyến/xe/trạm lần đầu, 
// bản đồ tự động phóng to vừa đủ bao hết các điểm, 
// mà không bị zoom liên tục khi dữ liệu cập nhật sau đó.
const FitBoundsOnce = ({ points }) => {
  const map = useMap();
  const [hasFit, setHasFit] = useState(false);
  useEffect(() => {
    if (!points || points.length === 0 || hasFit) return;
    const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng]));
    if (bounds.isValid()) {
      map.fitBounds(bounds.pad(0.2));
      setHasFit(true);
    }
  }, [points, map, hasFit]);
  return null;
};

// Component cập nhật marker động - re-mount khi vị trí thay đổi
const DynamicMarkers = ({ buses }) => {
  return (
    <>
      {buses.map((bus) => {
        // Tạo key duy nhất dựa trên id + tọa độ để force re-render khi vị trí đổi
        const uniqueKey = `${bus.id}-${bus.lat}-${bus.lng}-${bus.speed}`;
        console.log(`🔄 Render marker ${bus.id}: lat=${bus.lat}, lng=${bus.lng}, speed=${bus.speed}`);
        return (
          <Marker 
            key={uniqueKey}
            position={[bus.lat, bus.lng]} 
            icon={getSpeedIcon(bus.speed)}
          >
            <Popup>
              <div>
                <div className="font-semibold">{bus.licensePlate || bus.id}</div>
                <div>Lat: {Number(bus.lat).toFixed(5)}</div>
                <div>Lng: {Number(bus.lng).toFixed(5)}</div>
                <div>Tốc độ: {bus.speed != null ? Number(bus.speed).toFixed(1) : '-'} km/h</div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
};

const LiveLocationPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liveLocations, setLiveLocations] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [routes, setRoutes] = useState({}); // {routeId: {waypoints: [...], color: ...}}
  const [stops, setStops] = useState([]); // Danh sách điểm dừng

  // Load stops (chạy 1 lần khi mount)
  useEffect(() => {
    const loadStops = async () => {
      try {
        const data = await getLocations();
        setStops(Array.isArray(data) ? data : []);
      } catch (err) {
        console.warn('Không tải được danh sách điểm dừng:', err);
      }
    };
    loadStops();
  }, []);

  // Load routes waypoints (chạy 1 lần khi mount)
  useEffect(() => {
    const loadRoutes = async () => {
      try {
        // Giả sử bus có route_id, lấy unique route IDs từ bus data
        // Tạm thời hard-code R001 và R002 để test
        const routeIds = ['R001', 'R002'];
        const routeColors = ['#3b82f6', '#10b981']; // xanh dương, xanh lá
        
        const routeData = {};
        for (let i = 0; i < routeIds.length; i++) {
          const routeId = routeIds[i];
          try {
            const data = await getRouteWaypoints(routeId);
            routeData[routeId] = {
              waypoints: data.waypoints || [],
              routeName: data.routeName,
              color: routeColors[i],
            };
          } catch (err) {
            console.warn(`Không tải được route ${routeId}:`, err);
          }
        }
        setRoutes(routeData);
      } catch (err) {
        console.error('Lỗi khi load routes:', err);
      }
    };
    loadRoutes();
  }, []);

  // Polling live locations
  useEffect(() => {
    let canceled = false;
    const fetchLive = async () => {
      try {
        const data = await getLiveBusLocations();
        console.log('🌐 Raw data từ API:', data);
        if (!canceled) {
          const cleaned = Array.isArray(data)
            ? data.filter((x) => x && x.lat != null && x.lng != null)
            : [];
          console.log('📍 Cập nhật vị trí xe:', cleaned);
          console.table(cleaned); // Hiển thị dạng bảng để dễ so sánh
          
          // FORCE RE-RENDER bằng cách tạo object hoàn toàn mới với timestamp
          const withTimestamp = cleaned.map(bus => ({
            ...bus,
            _fetchTime: Date.now() // Thêm timestamp để force unique reference
          }));
          
          setLiveLocations(withTimestamp);
          setLastUpdate(new Date().toLocaleTimeString('vi-VN'));
          setError(null);
        }
      } catch (err) {
        if (!canceled) {
          setError('Không thể tải dữ liệu vị trí.');
          console.error('Lỗi tải vị trí:', err);
        }
      } finally {
        if (!canceled) setLoading(false);
      }
    };
    fetchLive();
    const intervalId = setInterval(fetchLive, 3000);
    return () => { canceled = true; clearInterval(intervalId); };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Vị trí xe (Realtime)</h2>
        <p className="text-gray-600 mt-1">
          Cập nhật tự động mỗi 3 giây
          {lastUpdate && <span className="ml-2 text-sm text-blue-600">• Lần cuối: {lastUpdate}</span>}
        </p>
      </div>

      {/* Bản đồ trực tiếp */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Bản đồ trực tiếp</h3>
        <div className="rounded-lg overflow-hidden" style={{ height: '500px' }}>
          <MapContainer
            center={[10.762622, 106.660172]}
            zoom={12}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* VẼ LỘ TRÌNH CHO TỪNG ROUTE */}
            {Object.entries(routes).map(([routeId, routeInfo]) => {
              const { waypoints, color, routeName } = routeInfo;
              if (!waypoints || waypoints.length === 0) return null;
              
              // Tạo array tọa độ cho Polyline
              const positions = waypoints.map(wp => [wp.latitude, wp.longitude]);
              
              return (
                <React.Fragment key={routeId}>
                  {/* Đường nối (Polyline) */}
                  <Polyline
                    positions={positions}
                    color={color}
                    weight={4}
                    opacity={0.7}
                  >
                    <Popup>{routeName || routeId}</Popup>
                  </Polyline>
                  
                  {/* Điểm dừng (Circle) */}
                  {waypoints.filter(wp => wp.is_stop).map(wp => (
                    <Circle
                      key={wp.id}
                      center={[wp.latitude, wp.longitude]}
                      radius={50}
                      pathOptions={{ color: color, fillColor: color, fillOpacity: 0.3 }}
                    >
                      <Popup>
                        <div>
                          <strong>{wp.stop_name || 'Điểm dừng'}</strong>
                          <br />
                          Lat: {Number(wp.latitude).toFixed(5)}
                          <br />
                          Lng: {Number(wp.longitude).toFixed(5)}
                        </div>
                      </Popup>
                    </Circle>
                  ))}
                </React.Fragment>
              );
            })}
            
            {/* Hiển thị tất cả điểm dừng (stops) */}
            {stops.map((stop) => {
              const stopIcon = L.divIcon({
                className: '',
                html: '<div style="font-size:16px; opacity:0.7;">🚏</div>',
                iconSize: [16, 16],
                iconAnchor: [8, 16],
                popupAnchor: [0, -16],
                zIndexOffset: -100, // Đặt z-index thấp để xe đè lên
              });
              
              return (
                <Marker
                  key={stop.id}
                  position={[stop.latitude, stop.longitude]}
                  icon={stopIcon}
                >
                  <Popup>
                    <div>
                      <strong className="text-red-600">{stop.name}</strong>
                      <br />
                      <span className="text-sm text-gray-600">{stop.address || 'Không có địa chỉ'}</span>
                      <br />
                      Lat: {Number(stop.latitude).toFixed(5)}
                      <br />
                      Lng: {Number(stop.longitude).toFixed(5)}
                    </div>
                  </Popup>
                </Marker>
              );
            })}
            
            {/* Tự động căn khung lần đầu */}
            <FitBoundsOnce points={liveLocations} />
            {/* Markers cập nhật động */}
            <DynamicMarkers buses={liveLocations} />
          </MapContainer>
        </div>
        {(!loading && (!liveLocations || liveLocations.length === 0)) && (
          <p className="text-gray-600 mt-3">Chưa có dữ liệu tọa độ để hiển thị trên bản đồ.</p>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Danh sách xe và toạ độ</h3>
        {loading ? (
          <p className="text-gray-600">Đang tải...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : (!liveLocations || liveLocations.length === 0) ? (
          <p className="text-gray-600">Chưa có dữ liệu vị trí. Hãy chạy xe hoặc cập nhật vị trí qua API.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Xe buýt</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vĩ độ (lat)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kinh độ (lng)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tốc độ (km/h)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cập nhật</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {liveLocations.map((bus) => (
                  <tr key={bus.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{bus.licensePlate || bus.id}</td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-700">{Number(bus.lat).toFixed(5)}</td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-700">{Number(bus.lng).toFixed(5)}</td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-700">{bus.speed != null ? Number(bus.speed).toFixed(1) : '-'}</td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">~3 giây</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveLocationPage;
