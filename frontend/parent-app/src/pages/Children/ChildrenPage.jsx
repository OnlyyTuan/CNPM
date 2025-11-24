import React, { useEffect, useState } from "react";
import { getSelfDetail } from "../../api/parentApi";

const ChildrenPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getSelfDetail();
        setStudents(res.data?.Students || []);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div>Đang tải...</div>;

  return (
    <div className="space-y-4">
      {students.map((s) => (
        <div key={s.id} className="bg-white rounded shadow p-4">
          <div className="font-semibold">{s.name}</div>
          <div className="text-sm text-gray-600">Trạng thái: {s.status}</div>
          <div className="text-sm text-gray-600">Bus: {s.assignedBusId || "-"}</div>
        </div>
      ))}
      {students.length === 0 && <div>Chưa có học sinh liên kết.</div>}
    </div>
  );
};

export default ChildrenPage;
