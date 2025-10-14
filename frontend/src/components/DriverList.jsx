// frontend/src/components/DriverList.jsx
import { useEffect, useState } from "react";
import axios from "axios";

function DriverList() {
  const [drivers, setDrivers] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:3000/drivers")
      .then((res) => setDrivers(res.data))
      .catch((err) => console.error(err));
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
