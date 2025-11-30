import { useEffect, useState } from 'react';
import { Polyline, Popup } from 'react-leaflet';

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
        const coordinates = waypoints
          .map(wp => `${wp.longitude},${wp.latitude}`)
          .join(';');

        const response = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson`
        );

        if (!response.ok) {
          throw new Error('OSRM API request failed');
        }

        const data = await response.json();

        if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
          const coords = data.routes[0].geometry.coordinates.map(
            ([lng, lat]) => [lat, lng]
          );
          setRouteCoordinates(coords);
        } else {
          const straightLine = waypoints.map(wp => [wp.latitude, wp.longitude]);
          setRouteCoordinates(straightLine);
        }
      } catch (error) {
        console.error(`Lỗi khi fetch route từ OSRM cho ${routeName}:`, error);
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
