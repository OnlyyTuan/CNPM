import React, { useEffect, useState } from "react";
import { getSelfDetail } from "../../api/parentApi";

const ParentDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getSelfDetail();
        setData(res.data);
      } catch (e) {
        setError(e.response?.data?.message || "Không thể tải dữ liệu phụ huynh.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!data) return <div>Không có dữ liệu</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Xin chào, {data.fullName}</h2>
        <p className="text-gray-600">SĐT: {data.phone}</p>
        <p className="text-gray-600">Địa chỉ: {data.address}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(data.Students || []).map((s) => (
          <div key={s.id} className="bg-white rounded-xl shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-lg">{s.name}</div>
                <div className="text-sm text-gray-500">Lớp {s.className} - Khối {s.grade}</div>
              </div>
              <div className={`text-sm px-2 py-1 rounded ${s.status === "IN_BUS" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{s.status || "WAITING"}</div>
            </div>
            <div className="mt-3 text-sm text-gray-700">Bus: {s.assignedBusId || "Chưa gán"}</div>
            <div className="mt-1 text-sm text-gray-700">Điểm đón: {s.pickupLocationId || "-"}</div>
            <div className="mt-1 text-sm text-gray-700">Điểm trả: {s.dropoffLocationId || "-"}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ParentDashboard;
