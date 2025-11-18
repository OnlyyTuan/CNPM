// frontend/src/components/DriverList.jsx
import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import { onEntityChange } from "../utils/eventBus";

function DriverList() {
  const [drivers, setDrivers] = useState([]);
  const [error, setError] = useState(null);
  const [availableBuses, setAvailableBuses] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [selectedBus, setSelectedBus] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchDrivers = () => {
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
  };

  const fetchAvailableBuses = async () => {
    try {
      const res = await axiosClient.get("/buses");
      const buses = res.data;
      // Filter buses không có driver
      const available = buses.filter((bus) => !bus.CurrentDriver);
      setAvailableBuses(available);
    } catch (err) {
      console.error("Error fetching available buses:", err);
      alert("Lỗi khi tải danh sách xe buýt");
    }
  };

  const handleAssignBus = async (driver) => {
    setSelectedDriver(driver);
    setShowModal(true);
    setLoading(true);

    try {
      await fetchAvailableBuses();
    } catch (err) {
      console.error("Error fetching available buses:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAssign = async () => {
    if (!selectedBus) {
      alert("Vui lòng chọn xe buýt");
      return;
    }

    console.log("Assigning bus:", {
      driverId: selectedDriver.id,
      busId: selectedBus,
    });

    try {
      await axiosClient.put(`/buses/${selectedBus}/assign-driver`, {
        driverId: selectedDriver.id,
      });
      alert("Gán xe buýt thành công!");
      setShowModal(false);
      setSelectedBus("");
      fetchDrivers(); // Reload danh sách tài xế
    } catch (err) {
      console.error("Error assigning bus:", err);
      alert(
        "Lỗi khi gán xe buýt: " + (err.response?.data?.message || err.message)
      );
    }
  };

  useEffect(() => {
    fetchDrivers();
    const unsubscribe = onEntityChange(({ entity }) => {
      // refresh drivers when drivers or buses change
      if (entity === "driver" || entity === "bus") {
        fetchDrivers();
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Danh sách tài xế</h2>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border">Họ tên</th>
              <th className="px-4 py-2 border">Số điện thoại</th>
              <th className="px-4 py-2 border">Số GPLX</th>
              <th className="px-4 py-2 border">Trạng thái</th>
              <th className="px-4 py-2 border">Xe phụ trách</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map((driver) => (
              <tr key={driver.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border font-medium">
                  {driver.full_name}
                </td>
                <td className="px-4 py-2 border">{driver.phone}</td>
                <td className="px-4 py-2 border">{driver.license_number}</td>
                <td className="px-4 py-2 border">
                  <span
                    className={`px-2 py-1 rounded text-sm ${
                      driver.status === "DRIVING"
                        ? "bg-green-200"
                        : driver.status === "OFF_DUTY"
                        ? "bg-gray-200"
                        : "bg-yellow-200"
                    }`}
                  >
                    {driver.status}
                  </span>
                </td>
                <td className="px-4 py-2 border">
                  {driver.CurrentBus ? (
                    <div>
                      <div className="font-medium">
                        {driver.CurrentBus.license_plate}
                      </div>
                      <div className="text-sm text-gray-600">
                        Sức chứa: {driver.CurrentBus.capacity} |{" "}
                        {driver.CurrentBus.status}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 italic">
                        Chưa phụ trách xe
                      </span>
                      <button
                        onClick={() => handleAssignBus(driver)}
                        className="bg-blue-500 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm ml-2"
                      >
                        Gán xe
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal gán xe buýt */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-xl font-bold mb-4">
              Gán xe buýt cho tài xế {selectedDriver?.full_name}
            </h3>

            {loading ? (
              <p>Đang tải danh sách xe buýt...</p>
            ) : (
              <div className="mb-4">
                <label className="block mb-2 font-medium">Chọn xe buýt:</label>
                <select
                  value={selectedBus}
                  onChange={(e) => setSelectedBus(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option value="">-- Chọn xe buýt --</option>
                  {availableBuses.map((bus) => (
                    <option key={bus.id} value={bus.id}>
                      {bus.license_plate} - Sức chứa: {bus.capacity} (
                      {bus.status})
                    </option>
                  ))}
                </select>
                {availableBuses.length === 0 && (
                  <p className="text-sm text-gray-500 mt-2">
                    Không có xe buýt nào chưa có tài xế
                  </p>
                )}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedBus("");
                }}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmitAssign}
                disabled={!selectedBus}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-700 text-white rounded disabled:bg-gray-300"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DriverList;
