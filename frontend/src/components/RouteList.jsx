// frontend/src/components/RouteList.jsx
import { useEffect, useState } from "react";
import axios from "axios";

function RouteList() {
  const [routes, setRoutes] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:3000/api/v1/routes")
      .then((res) => setRoutes(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      <h2>Danh sách tuyến đường</h2>
      <ul>
        {routes
          .filter((r) => ["1", "2"].includes(String(r.id)))
          .map((route) => (
            <li key={route.id}>
              {route.name} - Quãng đường: {route.distance} km - Thời gian dự
              kiến: {route.estimatedDuration} phút
            </li>
          ))}
      </ul>
    </div>
  );
}

export default RouteList;
