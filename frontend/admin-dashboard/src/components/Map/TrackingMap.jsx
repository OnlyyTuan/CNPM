// frontend/admin-dashboard/src/components/Map/TrackingMap.jsx

import React from 'react';
// import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'; // Dùng thư viện thực tế

/**
 * Component Bản đồ Theo dõi Xe buýt Trực tiếp
 * @param {Array<{id: string, lat: number, lng: number, licensePlate: string, speed: number}>} busLocations - Vị trí các xe buýt
 */
const TrackingMap = ({ busLocations }) => {
    // Vị trí trung tâm bản đồ mặc định (Ví dụ: Trung tâm Hà Nội/TP.HCM)
    const defaultCenter = [10.762622, 106.660172]; // TP.HCM (Giả định)

    if (!busLocations || busLocations.length === 0) {
        return (
            <div style={styles.mockMap}>
                <p>Không có xe buýt nào đang hoạt động hoặc không tìm thấy vị trí.</p>
            </div>
        );
    }

    // ------------------------------------------------------------------
    // MOCKUP BẢN ĐỒ (Thay thế bằng code Leaflet/Google Maps thực tế)
    // ------------------------------------------------------------------
    return (
        <div style={styles.mockMap}>
            <h4 style={{ color: '#007bff' }}>Mô phỏng Bản đồ Theo dõi Trực tiếp</h4>
            <p>Hiển thị vị trí {busLocations.length} xe buýt:</p>
            <ul style={{ listStyleType: 'none', padding: 0 }}>
                {busLocations.map(bus => (
                    <li key={bus.id} style={styles.busItem}>
                        🚌 **{bus.licensePlate}**: ({bus.lat.toFixed(4)}, {bus.lng.toFixed(4)}) - {bus.speed} km/h
                    </li>
                ))}
            </ul>

            {/* CODE THỰC TẾ SẼ DÙNG MapContainer, TileLayer và Markers
            <MapContainer center={defaultCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {busLocations.map(bus => (
                    <Marker key={bus.id} position={[bus.lat, bus.lng]}>
                        <Popup>Xe: {bus.licensePlate} | Tốc độ: {bus.speed} km/h</Popup>
                    </Marker>
                ))}
            </MapContainer>
            */}
        </div>
    );
};

const styles = {
    mockMap: {
        width: '100%',
        height: '100%',
        backgroundColor: '#e6f7ff',
        borderRadius: '8px',
        padding: '20px',
        boxShadow: 'inset 0 0 5px rgba(0,0,0,0.1)',
        overflow: 'auto',
    },
    busItem: {
        padding: '5px 0',
        borderBottom: '1px dotted #ccc',
        fontSize: '14px',
    }
};

export default TrackingMap;