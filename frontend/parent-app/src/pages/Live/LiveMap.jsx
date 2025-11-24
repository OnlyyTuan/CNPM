import React, { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { getSelfDetail } from "../../api/parentApi";
import { getLiveLocations } from "../../api/busApi";
import { getRouteWaypoints } from "../../api/routeApi";

const LiveMap = () => {
  const [busIds, setBusIds] = useState([]);
  const [locations, setLocations] = useState([]);
  const [error, setError] = useState(null);
  const [routeData, setRouteData] = useState({}); // { [routeId]: { waypoints: [...], stops: [...] } }

  useEffect(() => {
    let timer;
    const init = async () => {
      try {
        const res = await getSelfDetail();
        const ids = (res.data?.Students || [])
          .map((s) => s.assignedBusId)
          .filter(Boolean);
        setBusIds(Array.from(new Set(ids)));
      } catch (e) {
        setError(e.response?.data?.message || "Không thể tải dữ liệu.");
      }
    };
    const tick = async () => {
      try {
        const res = await getLiveLocations();
        const all = Array.isArray(res.data) ? res.data : [];
        const filtered = all.filter((b) => busIds.includes(b.id));
        setLocations(filtered);

        // Nạp dữ liệu tuyến (waypoints) cho các route chưa có
        const routeIds = Array.from(new Set(filtered.map((b) => b.route_id).filter(Boolean)));
        for (const rid of routeIds) {
          if (!routeData[rid]) {
            try {
              const wpRes = await getRouteWaypoints(rid);
              const wps = Array.isArray(wpRes.data?.waypoints) ? wpRes.data.waypoints : [];
              const stops = wps.filter((w) => w.is_stop);
              setRouteData((prev) => ({ ...prev, [rid]: { waypoints: wps, stops } }));
            } catch (e) {
              // ignore route load errors
            }
          }
        }
      } catch (e) {
        setError(e.response?.data?.message || "Không thể lấy vị trí xe.");
      }
    };
    init().then(() => tick());
    timer = setInterval(tick, 5000);
    return () => clearInterval(timer);
  }, [setBusIds]);

  useEffect(() => {
    const tick = async () => {
      try {
        const res = await getLiveLocations();
        const all = Array.isArray(res.data) ? res.data : [];
        const filtered = all.filter((b) => busIds.includes(b.id));
        setLocations(filtered);
      } catch (e) {}
    };
    if (busIds.length > 0) {
      tick();
    }
  }, [busIds]);

  const center = useMemo(() => {
    const first = locations.find((l) => Number.isFinite(l.lat) && Number.isFinite(l.lng));
    return first ? [first.lat, first.lng] : [10.762622, 106.660172];
  }, [locations]);

  if (error) return <div className="text-red-600">{error}</div>;
  if (busIds.length === 0) return <div>Chưa có xe buýt được gán cho học sinh.</div>;

  return (
    <div className="h-[70vh] w-full bg-white rounded-xl shadow overflow-hidden">
      <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {/* Vẽ Polyline cho các tuyến liên quan */}
        {Array.from(new Set(locations.map((b) => b.route_id).filter(Boolean))).map((rid) => {
          const r = routeData[rid];
          if (!r || !r.waypoints || r.waypoints.length === 0) return null;
          const coords = r.waypoints.map((w) => [Number(w.latitude), Number(w.longitude)]);
          return <Polyline key={`route-${rid}`} positions={coords} pathOptions={{ color: "#2563eb", weight: 4 }} />;
        })}

        {/* Vẽ stop markers trên tuyến */}
        {Array.from(new Set(locations.map((b) => b.route_id).filter(Boolean))).flatMap((rid) => {
          const r = routeData[rid];
          if (!r || !r.stops || r.stops.length === 0) return [];
          return r.stops.map((s) => (
            <CircleMarker key={`stop-${rid}-${s.id}`} center={[Number(s.latitude), Number(s.longitude)]} radius={6} pathOptions={{ color: "#f59e0b", fillColor: "#f59e0b", fillOpacity: 0.8 }}>
              <Popup>
                <div className="space-y-1">
                  <div>Điểm dừng: {s.stop_name || s.name}</div>
                  <div>Seq: {s.sequence}</div>
                </div>
              </Popup>
            </CircleMarker>
          ));
        })}

        {locations
          .filter((l) => Number.isFinite(l.lat) && Number.isFinite(l.lng))
          .map((l) => (
            <Marker key={l.id} position={[l.lat, l.lng]}>
              <Popup>
                <div className="space-y-1">
                  <div>Xe: {l.licensePlate}</div>
                  <div>Tốc độ: {l.speed ?? "-"} km/h</div>
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  );
};

export default LiveMap;
