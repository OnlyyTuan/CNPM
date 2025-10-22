// frontend/src/components/ScheduleList.jsx
import { useEffect, useState } from "react";
import axios from "axios";

function ScheduleList() {
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:3000/schedules")
      .then((res) => setSchedules(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      <h2>Danh sách lịch trình</h2>
      <ul>
        {schedules.map((schedule) => (
          <li key={schedule.id}>
            {schedule.date} - {schedule.time} - Bus: {schedule.bus_id} - Driver:{" "}
            {schedule.driver_id} - Route: {schedule.route_id} - Trạng thái:{" "}
            {schedule.status}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ScheduleList;
