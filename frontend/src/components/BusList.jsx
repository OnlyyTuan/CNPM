// frontend/src/components/BusList.jsx
import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";

function BusList() {
  const [buses, setBuses] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Không có token xác thực");
      return;
    }

    axiosClient
      .get("/buses")
      .then((res) => {
        console.log("Bus data:", res.data);
        setBuses(res.data);
      })
      .catch((err) => {
        console.error("Error fetching buses:", err);
        setError(err.message);
      });
  }, []);

  return (
    <div>
      <h2>Danh sách xe buýt</h2>
      <ul>
        {buses.map((bus) => (
          <li key={bus.id}>
            {bus.id} - Sức chứa: {bus.capacity} - Trạng thái: {bus.status}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default BusList;
