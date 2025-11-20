// frontend/src/components/DriverList.jsx
import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";

function DriverList() {
  const [drivers, setDrivers] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Không có token xác thực");
      return;
    }

    axiosClient
      .get("/drivers")
      .then((res) => {
        console.log("Driver data:", res.data);
        setDrivers(res.data);
      })
      .catch((err) => {
        console.error("Error fetching drivers:", err);
        setError(err.message);
      });
  }, []);

  return (
    <div>
      <h2>Danh sách tài xế</h2>
      <ul>
        {drivers.map((driver) => (
          <li key={driver.id}>
            {driver.name} - {driver.licenseNumber} - {driver.status}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default DriverList;
