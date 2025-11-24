import { useEffect, useState } from 'react';
import { Polyline, Popup } from 'react-leaflet';

/**
 * Component vẽ đường đi thực tế theo đường phố sử dụng OSRM API
 * @param {Array} waypoints - Mảng các điểm waypoint [{latitude, longitude}, ...]
 * @param {String} color - Màu của đường
 * @param {String} routeName - Tên tuyến đường
 */
const RoutingPolyline = ({ waypoints, color, routeName }) => {
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!waypoints || waypoints.length < 2) {
      setRouteCoordinates([]);
      setLoading(false);
      return;
    }

    const fetchRoute = async () => {
      try {
        setLoading(true);
        
        // Tạo chuỗi tọa độ cho OSRM API: longitude,latitude;longitude,latitude;...
        const coordinates = waypoints
          .map(wp => `${wp.longitude},${wp.latitude}`)
          .join(';');
        
        // Gọi OSRM API (public demo server)
        // Docs: http://project-osrm.org/docs/v5.24.0/api/
        const response = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson`
        );
        
        if (!response.ok) {
          throw new Error('OSRM API request failed');
        }
        
        const data = await response.json();
        
        if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
          // OSRM trả về coordinates dạng [longitude, latitude]
          // Cần đổi thành [latitude, longitude] cho Leaflet
          const coords = data.routes[0].geometry.coordinates.map(
            ([lng, lat]) => [lat, lng]
          );
          setRouteCoordinates(coords);
        } else {
          console.warn(`OSRM không tìm thấy route cho ${routeName}, fallback về Polyline thẳng`);
          // Fallback: vẽ đường thẳng nếu OSRM thất bại
          const straightLine = waypoints.map(wp => [wp.latitude, wp.longitude]);
          setRouteCoordinates(straightLine);
        }
      } catch (error) {
        console.error(`Lỗi khi fetch route từ OSRM cho ${routeName}:`, error);
        // Fallback: vẽ đường thẳng nếu lỗi
        const straightLine = waypoints.map(wp => [wp.latitude, wp.longitude]);
        setRouteCoordinates(straightLine);
      } finally {
        setLoading(false);
      }
    };

    fetchRoute();
  }, [waypoints, routeName]);

  if (loading || routeCoordinates.length === 0) {
    return null;
  }

  return (
    <Polyline
      positions={routeCoordinates}
      color={color}
      weight={4}
      opacity={0.7}
    >
      <Popup>{routeName}</Popup>
    </Polyline>
  );
};

export default RoutingPolyline;
