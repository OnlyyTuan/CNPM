// frontend/src/components/BusList.jsx
import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import { getAvailableDrivers } from "../api/driverApi";
import { assignDriverToBus, deleteBus } from "../api/busApi";

function BusList() {
  const [buses, setBuses] = useState([]);
  const [error, setError] = useState(null);
  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [selectedBus, setSelectedBus] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editFormData, setEditFormData] = useState({
    license_plate: "",
    capacity: "",
    status: "ACTIVE",
  });

  const fetchBuses = () => {
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
  };

  useEffect(() => {
    fetchBuses();
  }, []);

  const handleAssignDriver = async (bus) => {
    setSelectedBus(bus);
    setShowModal(true);
    setLoading(true);

    try {
      const drivers = await getAvailableDrivers();
      setAvailableDrivers(drivers);
    } catch (err) {
      console.error("Error fetching available drivers:", err);
      alert("Lỗi khi tải danh sách tài xế");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAssign = async () => {
    if (!selectedDriver) {
      alert("Vui lòng chọn tài xế");
      return;
    }

    console.log("Assigning driver:", {
      busId: selectedBus.id,
      driverId: selectedDriver,
    });

    try {
      await assignDriverToBus(selectedBus.id, selectedDriver);
      alert("Gán tài xế thành công!");
      setShowModal(false);
      setSelectedDriver("");
      fetchBuses(); // Reload danh sách xe
    } catch (err) {
      console.error("Error assigning driver:", err);
      alert(
        "Lỗi khi gán tài xế: " + (err.response?.data?.message || err.message)
      );
    }
  };

  const handleEditBus = (bus) => {
    setSelectedBus(bus);
    setEditFormData({
      license_plate: bus.license_plate,
      capacity: bus.capacity,
      status: bus.status,
    });
    setShowEditModal(true);
  };

  const handleSubmitEdit = async () => {
    if (!editFormData.license_plate || !editFormData.capacity) {
      alert("Vui lòng điền đầy đủ thông tin");
      return;
    }

    console.log("Updating bus:", selectedBus.id, editFormData);

    try {
      const token = localStorage.getItem("token");
      await axiosClient.put(`/buses/${selectedBus.id}`, editFormData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      alert("Cập nhật xe buýt thành công!");
      setShowEditModal(false);
      fetchBuses();
    } catch (err) {
      console.error("Error updating bus:", err);
      alert(
        "Lỗi khi cập nhật: " + (err.response?.data?.message || err.message)
      );
    }
  };

  const handleDeleteBus = async (bus) => {
    if (!confirm(`Bạn có chắc muốn xóa xe ${bus.license_plate}?`)) {
      return;
    }

    try {
      await deleteBus(bus.id);
      alert("Xóa xe buýt thành công!");
      fetchBuses();
    } catch (err) {
      console.error("Error deleting bus:", err);
      alert("Lỗi khi xóa xe: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Danh sách xe buýt</h2>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border">Biển số</th>
              <th className="px-4 py-2 border">Sức chứa</th>
              <th className="px-4 py-2 border">Trạng thái</th>
              <th className="px-4 py-2 border">Tài xế</th>
              <th className="px-4 py-2 border">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {buses.map((bus) => (
              <tr key={bus.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border">{bus.license_plate}</td>
                <td className="px-4 py-2 border text-center">{bus.capacity}</td>
                <td className="px-4 py-2 border">
                  <span
                    className={`px-2 py-1 rounded ${
                      bus.status === "ACTIVE" ? "bg-green-200" : "bg-gray-200"
                    }`}
                  >
                    {bus.status}
                  </span>
                </td>
                <td className="px-4 py-2 border">
                  {bus.CurrentDriver ? (
                    <div>
                      <div className="font-medium">
                        {bus.CurrentDriver.full_name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {bus.CurrentDriver.phone}
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-400 italic">Chưa có tài xế</span>
                  )}
                </td>
                <td className="px-4 py-2 border text-center">
                  <div className="flex gap-2 justify-center">
                    {/* Icon Sửa */}
                    <button
                      onClick={() => handleEditBus(bus)}
                      className="text-yellow-600 hover:text-yellow-800"
                      title="Sửa"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>

                    {/* Icon Xóa */}
                    <button
                      onClick={() => handleDeleteBus(bus)}
                      className="text-red-600 hover:text-red-800"
                      title="Xóa"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>

                    {/* Assignment handled in Phân công page; remove inline Add Driver button */}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal gán tài xế */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-xl font-bold mb-4">
              Gán tài xế cho xe {selectedBus?.license_plate}
            </h3>

            {loading ? (
              <p>Đang tải danh sách tài xế...</p>
            ) : (
              <div className="mb-4">
                <label className="block mb-2 font-medium">Chọn tài xế:</label>
                <select
                  value={selectedDriver}
                  onChange={(e) => setSelectedDriver(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option value="">-- Chọn tài xế --</option>
                  {availableDrivers.map((driver) => (
                    <option key={driver.id} value={driver.id}>
                      {driver.full_name} - {driver.phone} (GPLX:{" "}
                      {driver.license_number})
                    </option>
                  ))}
                </select>
                {availableDrivers.length === 0 && (
                  <p className="text-sm text-gray-500 mt-2">
                    Không có tài xế nào chưa phụ trách xe
                  </p>
                )}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedDriver("");
                }}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmitAssign}
                disabled={!selectedDriver}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-700 text-white rounded disabled:bg-gray-300"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal sửa xe buýt */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-xl font-bold mb-4">
              Sửa thông tin xe {selectedBus?.license_plate}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block mb-2 font-medium">Biển số xe:</label>
                <input
                  type="text"
                  value={editFormData.license_plate}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      license_plate: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="Nhập biển số xe"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium">Sức chứa:</label>
                <input
                  type="number"
                  value={editFormData.capacity}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      capacity: parseInt(e.target.value),
                    })
                  }
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="Nhập sức chứa"
                  min="1"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium">Trạng thái:</label>
                <select
                  value={editFormData.status}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, status: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                  <option value="MAINTENANCE">MAINTENANCE</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditFormData({
                    license_plate: "",
                    capacity: "",
                    status: "ACTIVE",
                  });
                }}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmitEdit}
                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded"
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BusList;
