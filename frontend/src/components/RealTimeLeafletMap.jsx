import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './RealTimeLeafletMap.css';

// Fix Leaflet default marker icons (known issue)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom icon cho xe bus
const busIcon = new L.DivIcon({
  html: `
    <div class="bus-marker">
      <div class="bus-icon">🚌</div>
    </div>
  `,
  className: 'custom-div-icon',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40]
});

// Custom icon cho điểm đón
const pickupIcon = new L.DivIcon({
  html: `
    <div class="pickup-marker">
      <div class="pickup-icon">📍</div>
    </div>
  `,
  className: 'custom-div-icon',
  iconSize: [35, 35],
  iconAnchor: [17.5, 35],
  popupAnchor: [0, -35]
});

// Custom icon cho trường học
const schoolIcon = new L.DivIcon({
  html: `
    <div class="school-marker">
      <div class="school-icon">🏫</div>
    </div>
  `,
  className: 'custom-div-icon',
  iconSize: [35, 35],
  iconAnchor: [17.5, 35],
  popupAnchor: [0, -35]
});

// Custom icon cho điểm dừng
const getStopIcon = (orderNumber) => new L.DivIcon({
  html: `
    <div class="stop-marker">
      <div class="stop-number">${orderNumber}</div>
    </div>
  `,
  className: 'custom-div-icon',
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30]
});

// Component để auto fit bounds
function FitBounds({ bounds }) {
  const map = useMap();
  
  useEffect(() => {
    if (bounds && bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [bounds, map]);
  
  return null;
}

// Component để animate marker movement
function AnimatedMarker({ position, icon, children }) {
  const markerRef = useRef(null);
  const prevPositionRef = useRef(position);

  useEffect(() => {
    if (markerRef.current && prevPositionRef.current) {
      const marker = markerRef.current;
      const prevPos = prevPositionRef.current;
      const newPos = position;

      // Smooth animation
      let startTime = null;
      const duration = 1000; // 1 second

      function animate(currentTime) {
        if (!startTime) startTime = currentTime;
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        const lat = prevPos[0] + (newPos[0] - prevPos[0]) * progress;
        const lng = prevPos[1] + (newPos[1] - prevPos[1]) * progress;

        marker.setLatLng([lat, lng]);

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      }

      requestAnimationFrame(animate);
      prevPositionRef.current = position;
    }
  }, [position]);

  return (
    <Marker ref={markerRef} position={position} icon={icon}>
      {children}
    </Marker>
  );
}

function RealTimeLeafletMap({ 
  busLocation,
  pickupLocation,
  dropoffLocation,
  routeStops = [],
  showRoute = true,
  height = '600px',
  center = [10.8231, 106.6297], // Default: TP.HCM
  zoom = 13
}) {
  // Tính toán bounds để fit tất cả markers
  const calculateBounds = () => {
    const bounds = [];
    
    if (busLocation?.latitude && busLocation?.longitude) {
      bounds.push([busLocation.latitude, busLocation.longitude]);
    }
    if (pickupLocation?.latitude && pickupLocation?.longitude) {
      bounds.push([pickupLocation.latitude, pickupLocation.longitude]);
    }
    if (dropoffLocation?.latitude && dropoffLocation?.longitude) {
      bounds.push([dropoffLocation.latitude, dropoffLocation.longitude]);
    }
    routeStops.forEach(stop => {
      if (stop.latitude && stop.longitude) {
        bounds.push([stop.latitude, stop.longitude]);
      }
    });
    
    return bounds.length > 0 ? bounds : null;
  };

  // Tạo polyline path từ route stops
  const routePath = showRoute && routeStops.length > 0
    ? routeStops
        .sort((a, b) => a.stop_order - b.stop_order)
        .map(stop => [stop.latitude, stop.longitude])
    : [];

  const bounds = calculateBounds();
  const mapCenter = busLocation?.latitude && busLocation?.longitude
    ? [busLocation.latitude, busLocation.longitude]
    : center;

  return (
    <div className="leaflet-map-wrapper" style={{ height }}>
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        style={{ height: '100%', width: '100%', borderRadius: '12px' }}
        scrollWheelZoom={true}
      >
        {/* OpenStreetMap Tile Layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        {/* Alternative Tile Layers - Uncomment to use */}
        {/* 
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        */}

        {/* Marker xe bus với animation */}
        {busLocation?.latitude && busLocation?.longitude && (
          <AnimatedMarker
            position={[busLocation.latitude, busLocation.longitude]}
            icon={busIcon}
          >
            <Popup className="custom-popup">
              <div className="popup-content">
                <h3 className="popup-title">🚌 Xe Bus {busLocation.bus_id || ''}</h3>
                <div className="popup-info">
                  <p><strong>Vị trí:</strong> {busLocation.current_location_name || 'Đang di chuyển'}</p>
                  <p><strong>Vận tốc:</strong> {busLocation.speed || 0} km/h</p>
                  <p><strong>Trạng thái:</strong> {busLocation.bus_status || 'N/A'}</p>
                  {busLocation.driver_name && (
                    <p><strong>Tài xế:</strong> {busLocation.driver_name}</p>
                  )}
                  {busLocation.lastUpdate && (
                    <p className="popup-time">
                      <strong>Cập nhật:</strong>{' '}
                      {new Date(busLocation.lastUpdate).toLocaleTimeString('vi-VN')}
                    </p>
                  )}
                </div>
              </div>
            </Popup>
          </AnimatedMarker>
        )}

        {/* Marker điểm đón */}
        {pickupLocation?.latitude && pickupLocation?.longitude && (
          <Marker
            position={[pickupLocation.latitude, pickupLocation.longitude]}
            icon={pickupIcon}
          >
            <Popup className="custom-popup">
              <div className="popup-content">
                <h3 className="popup-title pickup-title">📍 Điểm đón</h3>
                <div className="popup-info">
                  <p><strong>Tên:</strong> {pickupLocation.pickup_location_name || pickupLocation.name}</p>
                  {pickupLocation.address && (
                    <p><strong>Địa chỉ:</strong> {pickupLocation.address}</p>
                  )}
                  {pickupLocation.pickup_time && (
                    <p><strong>Giờ đón:</strong> {pickupLocation.pickup_time}</p>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Marker trường học/điểm trả */}
        {dropoffLocation?.latitude && dropoffLocation?.longitude && (
          <Marker
            position={[dropoffLocation.latitude, dropoffLocation.longitude]}
            icon={schoolIcon}
          >
            <Popup className="custom-popup">
              <div className="popup-content">
                <h3 className="popup-title school-title">🏫 Trường học</h3>
                <div className="popup-info">
                  <p><strong>Tên:</strong> {dropoffLocation.dropoff_location_name || dropoffLocation.name}</p>
                  {dropoffLocation.address && (
                    <p><strong>Địa chỉ:</strong> {dropoffLocation.address}</p>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Markers cho các điểm dừng trên tuyến */}
        {routeStops.map((stop, index) => (
          <Marker
            key={stop.location_id}
            position={[stop.latitude, stop.longitude]}
            icon={getStopIcon(stop.stop_order || index + 1)}
          >
            <Popup className="custom-popup">
              <div className="popup-content">
                <h3 className="popup-title stop-title">
                  Điểm dừng {stop.stop_order || index + 1}
                </h3>
                <div className="popup-info">
                  <p><strong>Tên:</strong> {stop.name}</p>
                  {stop.address && (
                    <p><strong>Địa chỉ:</strong> {stop.address}</p>
                  )}
                  {stop.estimatedTime && (
                    <p><strong>Giờ dự kiến:</strong> {stop.estimatedTime}</p>
                  )}
                  <p><strong>Loại:</strong> {stop.type}</p>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Polyline cho tuyến đường */}
        {showRoute && routePath.length > 1 && (
          <Polyline
            positions={routePath}
            pathOptions={{
              color: '#007bff',
              weight: 4,
              opacity: 0.8,
              dashArray: '10, 10'
            }}
          />
        )}

        {/* Auto fit bounds */}
        <FitBounds bounds={bounds} />
      </MapContainer>

      {/* Map legend */}
      <div className="map-legend">
        <div className="legend-item">
          <span className="legend-icon">🚌</span>
          <span>Xe bus</span>
        </div>
        <div className="legend-item">
          <span className="legend-icon">📍</span>
          <span>Điểm đón</span>
        </div>
        <div className="legend-item">
          <span className="legend-icon">🏫</span>
          <span>Trường học</span>
        </div>
        <div className="legend-item">
          <span className="legend-icon" style={{ background: '#ffc107', color: 'white', borderRadius: '50%', width: '25px', height: '25px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>1</span>
          <span>Điểm dừng</span>
        </div>
      </div>
    </div>
  );
}

export default RealTimeLeafletMap;