// frontend/src/pages/Live/LiveLocationPage.jsx
// Trang hiển thị vị trí xe buýt theo thời gian thực (polling mỗi 3 giây)

import React, { useEffect, useState, useRef } from 'react';
import { getLiveBusLocations } from '../../api/busApi';
import { getRouteWaypoints } from '../../api/routeApi';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api.config';
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
  // DivIcon hình tròn có viền, dễ nhìn trên map
  const html = `
    <span style="
      display:inline-block;
      width:18px; height:18px;
      border-radius:50%;
      background:${color};
      border:2px solid white;
      box-shadow:0 0 0 2px rgba(0,0,0,0.25);
    "></span>`;
  return L.divIcon({ className: '', html, iconSize: [18, 18], iconAnchor: [9, 9], popupAnchor: [0, -10] });
};

// Component phụ để tự động fitBounds lần đầu
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
const DynamicMarkers = ({ buses, routes }) => {
  return (
    <>
      {buses.map((bus) => {
        // Tạo key duy nhất dựa trên id + tọa độ để force re-render khi vị trí đổi
        const uniqueKey = `${bus.id}-${bus.lat}-${bus.lng}-${bus.speed}`;
        const routeColor = bus.routeId && routes[bus.routeId] ? routes[bus.routeId].color : '#6b7280';
        console.log(`🔄 Render marker ${bus.id}: lat=${bus.lat}, lng=${bus.lng}, speed=${bus.speed}, route=${bus.routeId}`);
        return (
          <Marker 
            key={uniqueKey}
            position={[bus.lat, bus.lng]} 
            icon={getSpeedIcon(bus.speed)}
          >
            <Popup>
              <div>
                <div className="font-semibold">{bus.licensePlate || bus.id}</div>
                <div style={{color: routeColor, fontWeight: 'bold'}}>
                  {bus.routeName || (bus.routeId ? `Tuyến ${bus.routeId}` : 'Chưa có tuyến')}
                </div>
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
  const [stops, setStops] = useState([]); // Danh sách điểm dừng từ database

  // Load stops from database
  useEffect(() => {
    const loadStops = async () => {
      try {
        const response = await axios.get(`${API_ENDPOINTS.ROUTES}/locations`);
        const stopsData = Array.isArray(response.data) ? response.data : [];
        console.log('🚏 Loaded stops:', stopsData);
        setStops(stopsData);
      } catch (err) {
        console.error('Lỗi khi load điểm dừng:', err);
      }
    };
    loadStops();
  }, []);

  // Load routes waypoints (chạy 1 lần khi mount)
  useEffect(() => {
    const loadRoutes = async () => {
      try {
        // Lấy danh sách xe để biết có những route nào đang hoạt động
        const buses = await getLiveBusLocations();
        const uniqueRouteIds = [...new Set(buses.filter(b => b.routeId).map(b => b.routeId))];
        
        console.log('🚍 Các tuyến đang có xe:', uniqueRouteIds);
        
        const routeColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
        
        const routeData = {};
        for (let i = 0; i < uniqueRouteIds.length; i++) {
          const routeId = uniqueRouteIds[i];
          try {
            const data = await getRouteWaypoints(routeId);
            console.log(`📦 API trả về cho tuyến ${routeId}:`, data);
            
            // Backend trả về: { routeId, routeName, waypoints: [...] }
            const waypointsList = data.waypoints || data || [];
            
            routeData[routeId] = {
              waypoints: waypointsList,
              routeName: data.routeName || routeId,
              color: routeColors[i % routeColors.length],
            };
            console.log(`✅ Đã load ${routeData[routeId].waypoints.length} waypoints cho tuyến ${routeId}`);
          } catch (err) {
            console.warn(`Không tải được route ${routeId}:`, err);
          }
        }
        console.log('🗺️ Tổng hợp routes:', routeData);
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
              console.log(`🎨 Vẽ tuyến ${routeId}:`, { 
                color, 
                routeName, 
                waypointCount: waypoints?.length,
                firstWaypoint: waypoints?.[0]
              });
              
              if (!waypoints || waypoints.length === 0) {
                console.warn(`⚠️ Tuyến ${routeId} không có waypoints`);
                return null;
              }
              
              // Tạo array tọa độ cho Polyline
              const positions = waypoints
                .filter(wp => wp.latitude != null && wp.longitude != null)
                .map(wp => [Number(wp.latitude), Number(wp.longitude)]);
              
              console.log(`📍 Tuyến ${routeId} có ${positions.length} điểm:`, positions[0], '...', positions[positions.length-1]);
              
              if (positions.length < 2) {
                console.warn(`⚠️ Tuyến ${routeId} không đủ điểm để vẽ polyline`);
                return null;
              }
              
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
                  {waypoints.filter(wp => wp.is_stop || wp.is_stop === 1).map((wp, idx) => (
                    <Circle
                      key={wp.id || `${routeId}-stop-${idx}`}
                      center={[Number(wp.latitude), Number(wp.longitude)]}
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
            
            {/* HIỂN THỊ ĐIỂM DỪNG TỪ DATABASE */}
            {stops.map((stop) => {
              const lat = Number(stop.latitude);
              const lng = Number(stop.longitude);
              if (!lat || !lng) return null;
              
              // Icon cho điểm dừng
              const stopIcon = L.divIcon({
                className: '',
                html: `<div style="
                  width: 24px;
                  height: 24px;
                  background: #ef4444;
                  border: 3px solid white;
                  border-radius: 50%;
                  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 14px;
                  color: white;
                  font-weight: bold;
                ">🚏</div>`,
                iconSize: [24, 24],
                iconAnchor: [12, 12],
                popupAnchor: [0, -12]
              });
              
              return (
                <Marker
                  key={stop.id}
                  position={[lat, lng]}
                  icon={stopIcon}
                >
                  <Popup>
                    <div className="text-sm">
                      <strong className="text-base">{stop.name}</strong>
                      <br />
                      📍 {stop.address}
                      <br />
                      <span className="text-gray-500 text-xs">
                        {lat.toFixed(5)}, {lng.toFixed(5)}
                      </span>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
            
            {/* Tự động căn khung lần đầu */}
            <FitBoundsOnce points={liveLocations} />
            {/* Markers cập nhật động */}
            <DynamicMarkers buses={liveLocations} routes={routes} />
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
