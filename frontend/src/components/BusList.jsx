// frontend/src/components/BusList.jsx
import { useEffect, useState } from "react";
import axios from "axios";

function BusList() {
  const [buses, setBuses] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/v1/buses")
      .then((res) => setBuses(res.data))
      .catch((err) => console.error(err));
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
