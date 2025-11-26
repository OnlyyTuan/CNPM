// frontend/src/pages/Buses/BusesPage.jsx
// Trang quản lý danh sách Xe buýt

import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Bus as BusIcon,
  Eye,
  Bell,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  getAllBuses,
  deleteBus,
  assignDriverToBus,
  updateBus,
  createBus,
} from "../../api/busApi";
import { getAvailableDrivers, getAllDrivers } from "../../api/driverApi";
import notificationApi from "../../api/notificationApi";
import AddBusModal from "../../components/Buses/AddBusModal";
import { emitEntityChange } from "../../utils/eventBus";

const BusesPage = () => {
  const [buses, setBuses] = useState([]);
  const [filteredBuses, setFilteredBuses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedBus, setSelectedBus] = useState(null);
  const [isAssignDriverModalOpen, setIsAssignDriverModalOpen] = useState(false);
  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [selectedDriverId, setSelectedDriverId] = useState("");
  const [driversMap, setDriversMap] = useState({});

  // Notification Modal State
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);
  const [notifyTitle, setNotifyTitle] = useState("");
  const [notifyMessage, setNotifyMessage] = useState("");
  const [sendingNotify, setSendingNotify] = useState(false);

  useEffect(() => {
    fetchBuses();
  }, []);

  useEffect(() => {
    let filtered = buses;
    const q = searchTerm.trim().toLowerCase();

    if (q) {
      filtered = filtered.filter((bus) => {
        const byPlate = (bus.license_plate || "").toLowerCase().includes(q);
        const byId = (bus.id || "").toLowerCase().includes(q);
        let byDriver = false;
        if (bus.driver_id && driversMap[bus.driver_id]) {
          const d = driversMap[bus.driver_id];
          const driverName =
            (d.User && d.User.full_name) ||
            d.full_name ||
            d.fullName ||
            d.name ||
            "";
          byDriver = String(driverName).toLowerCase().includes(q);
        }
        return byPlate || byId || byDriver;
      });
    }

    if (filterStatus !== "ALL") {
      filtered = filtered.filter((bus) => bus.status === filterStatus);
    }
    setFilteredBuses(filtered);
  }, [searchTerm, filterStatus, buses, driversMap]);

  const fetchBuses = async () => {
    try {
      setLoading(true);
      const [data, drivers] = await Promise.all([
        getAllBuses(),
        getAllDrivers(),
      ]);
      setBuses(data);
      setFilteredBuses(data);

      const dmap = {};
      (drivers || []).forEach((d) => {
        if (!d) return;
        const uid = d.id ?? d.user_id ?? d.userId ?? (d.User && d.User.id);
        if (uid != null) dmap[uid] = d;
      });
      setDriversMap(dmap);
    } catch (error) {
      console.error("Lỗi khi tải danh sách xe buýt:", error);
      toast.error("Không thể tải danh sách xe buýt: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa xe buýt này?")) {
      return;
    }
    try {
      await deleteBus(id);
      toast.success("Xóa xe buýt thành công");
      fetchBuses();
      emitEntityChange("bus");
    } catch (error) {
      console.error("Lỗi khi xóa xe buýt:", error);
      toast.error("Không thể xóa xe buýt: " + error.message);
    }
  };

  const handleAddBus = async (busData) => {
    try {
      const created = await createBus(busData);
      if (busData.driver_id) {
        try {
          await assignDriverToBus(created.id, busData.driver_id);
        } catch (err) {
          console.error("Lỗi khi gán tài xế sau khi tạo xe:", err);
          toast.error("Xe được tạo nhưng không thể gán tài xế");
        }
      }
      toast.success("Thêm xe buýt thành công!");
      setIsModalOpen(false);
      fetchBuses();
      emitEntityChange("bus");
    } catch (error) {
      console.error("Lỗi khi thêm xe buýt:", error);
      toast.error("Không thể thêm xe buýt");
    }
  };

  const handleViewBus = (bus) => {
    setSelectedBus(bus);
    setIsViewModalOpen(true);
  };

  const handleEditBus = async (bus) => {
    setSelectedBus(bus);
    try {
      const drivers = await getAvailableDrivers();
      setAvailableDrivers(drivers);
      setIsEditModalOpen(true);
    } catch (error) {
      console.error("Lỗi khi tải danh sách tài xế:", error);
      toast.error("Không thể tải danh sách tài xế");
      setIsEditModalOpen(true);
    }
  };

  const handleUpdateBus = async (busData) => {
    try {
      if (Object.prototype.hasOwnProperty.call(busData, "driver_id")) {
        const driverId = busData.driver_id || null;
        await assignDriverToBus(selectedBus.id, driverId);
        const { driver_id, ...other } = busData;
        if (Object.keys(other).length > 0) {
          await updateBus(selectedBus.id, other);
        }
      } else {
        await updateBus(selectedBus.id, busData);
      }
      toast.success("Cập nhật xe buýt thành công!");
      setIsEditModalOpen(false);
      setSelectedBus(null);
      fetchBuses();
      emitEntityChange("bus");
    } catch (error) {
      console.error("Lỗi khi cập nhật xe buýt:", error);
      const errorMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Không thể cập nhật xe buýt";
      toast.error(errorMsg);
    }
  };

  const handleOpenAssignDriverModal = async (bus) => {
    setSelectedBus(bus);
    try {
      const drivers = await getAvailableDrivers();
      setAvailableDrivers(drivers);
      setIsAssignDriverModalOpen(true);
    } catch (error) {
      console.error("Lỗi khi tải danh sách tài xế:", error);
      toast.error("Không thể tải danh sách tài xế có sẵn");
    }
  };

  const handleAssignDriver = async () => {
    if (!selectedDriverId) {
      toast.error("Vui lòng chọn tài xế");
      return;
    }
    try {
      await assignDriverToBus(selectedBus.id, selectedDriverId);
      toast.success("Gán tài xế thành công!");
      setIsAssignDriverModalOpen(false);
      setSelectedBus(null);
      setSelectedDriverId("");
      fetchBuses();
      emitEntityChange("bus");
    } catch (error) {
      console.error("Lỗi khi gán tài xế:", error);
      toast.error("Không thể gán tài xế cho xe buýt");
    }
  };

  // Notification Handlers
  const handleOpenNotifyModal = (bus) => {
    setSelectedBus(bus);
    setNotifyTitle(`Thông báo xe ${bus.license_plate}`);
    setNotifyMessage("");
    setIsNotifyModalOpen(true);
  };

  const handleSendNotification = async () => {
    if (!notifyTitle.trim() || !notifyMessage.trim()) {
      toast.error("Vui lòng nhập tiêu đề và nội dung");
      return;
    }

    setSendingNotify(true);
    try {
      const result = await notificationApi.sendToBus({
        busId: selectedBus.id,
        title: notifyTitle,
        message: notifyMessage,
      });

      if (result.success) {
        toast.success(result.message);
        setIsNotifyModalOpen(false);
        setNotifyTitle("");
        setNotifyMessage("");
        setSelectedBus(null);
      } else {
        toast.error(result.message || "Gửi thất bại");
      }
    } catch (error) {
      console.error("Error sending notification:", error);
      toast.error(error.response?.data?.message || "Lỗi khi gửi thông báo");
    } finally {
      setSendingNotify(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Quản lý Xe buýt</h2>
          <p className="text-gray-600 mt-1">
            Danh sách tất cả xe buýt trong hệ thống
          </p>
        </div>
        <button
          onClick={async () => {
            try {
              const drivers = await getAvailableDrivers();
              setAvailableDrivers(drivers);
            } catch (err) {
              console.error("Lỗi khi tải danh sách tài xế:", err);
              toast.error("Không thể tải danh sách tài xế");
            }
            setIsModalOpen(true);
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
        >
          <Plus size={20} />
          <span>Thêm Xe buýt</span>
        </button>
      </div>

      <AddBusModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddBus}
        availableDrivers={availableDrivers}
      />

      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Tìm kiếm theo biển số hoặc mã xe..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="ACTIVE">Hoạt động</option>
            <option value="MAINTENANCE">Bảo trì</option>
            <option value="INACTIVE">Không hoạt động</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Tổng số xe</p>
          <p className="text-2xl font-bold text-blue-600">{buses.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Đang hoạt động</p>
          <p className="text-2xl font-bold text-green-600">
            {buses.filter((b) => b.status === "ACTIVE").length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Đang bảo trì</p>
          <p className="text-2xl font-bold text-yellow-600">
            {buses.filter((b) => b.status === "MAINTENANCE").length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Không hoạt động</p>
          <p className="text-2xl font-bold text-red-600">
            {buses.filter((b) => b.status === "INACTIVE").length}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Xe buýt
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sức chứa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tài xế
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số điện thoại
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tuyến đường
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBuses.map((bus) => (
                <tr key={bus.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <BusIcon size={24} className="text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {bus.license_plate}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {bus.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {bus.capacity} chỗ
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {bus.driver_id ? (
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {driversMap[bus.driver_id]?.User?.full_name ||
                            driversMap[bus.driver_id]?.full_name ||
                            driversMap[bus.driver_id]?.fullName ||
                            "N/A"}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {bus.driver_id}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400">Chưa có</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {bus.driver_id ? (
                      <div className="text-sm text-gray-900">
                        {driversMap[bus.driver_id]?.phone ||
                          driversMap[bus.driver_id]?.User?.phone ||
                          "Chưa có"}
                      </div>
                    ) : (
                      <span className="text-gray-400">Chưa có</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {bus.route_id || (
                      <span className="text-gray-400">Chưa có</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${
                        bus.status === "ACTIVE"
                          ? "bg-green-100 text-green-800"
                          : bus.status === "MAINTENANCE"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {bus.status === "ACTIVE"
                        ? "Hoạt động"
                        : bus.status === "MAINTENANCE"
                        ? "Bảo trì"
                        : "Không hoạt động"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleOpenNotifyModal(bus)}
                        className="text-purple-600 hover:text-purple-900"
                        title="Gửi thông báo cho phụ huynh"
                      >
                        <Bell size={18} />
                      </button>
                      <button
                        onClick={() => handleViewBus(bus)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Xem chi tiết"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => handleEditBus(bus)}
                        className="text-yellow-600 hover:text-yellow-900"
                        title="Chỉnh sửa"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(bus.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Xóa"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredBuses.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl shadow-md">
          <p className="text-gray-500">Không tìm thấy xe buýt nào</p>
        </div>
      )}

      {isViewModalOpen && selectedBus && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-full">
            <h3 className="text-xl font-bold mb-4">Chi tiết Xe buýt</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Mã xe:
                </label>
                <p className="text-gray-900">{selectedBus.id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Biển số:
                </label>
                <p className="text-gray-900">{selectedBus.license_plate}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Sức chứa:
                </label>
                <p className="text-gray-900">{selectedBus.capacity} chỗ</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Tài xế:
                </label>
                <p className="text-gray-900">
                  {selectedBus.driver_id
                    ? driversMap[selectedBus.driver_id]?.User?.full_name ||
                      driversMap[selectedBus.driver_id]?.full_name ||
                      driversMap[selectedBus.driver_id]?.fullName ||
                      selectedBus.driver_id
                    : "Chưa có"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Tuyến đường:
                </label>
                <p className="text-gray-900">
                  {selectedBus.route_id || "Chưa có"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Trạng thái:
                </label>
                <p className="text-gray-900">
                  {selectedBus.status === "ACTIVE"
                    ? "Hoạt động"
                    : selectedBus.status === "MAINTENANCE"
                    ? "Bảo trì"
                    : "Không hoạt động"}
                </p>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => {
                  setIsViewModalOpen(false);
                  setSelectedBus(null);
                }}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {isEditModalOpen && selectedBus && (
        <AddBusModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedBus(null);
          }}
          onSubmit={handleUpdateBus}
          initialData={selectedBus}
          availableDrivers={availableDrivers}
        />
      )}

      {isAssignDriverModalOpen && selectedBus && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-full">
            <h3 className="text-xl font-bold mb-4">
              Gán tài xế cho xe {selectedBus.license_plate}
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chọn tài xế:
              </label>
              <select
                value={selectedDriverId}
                onChange={(e) => setSelectedDriverId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Chọn tài xế --</option>
                {availableDrivers.map((driver) => (
                  <option key={driver.id} value={driver.id}>
                    {driver.id} - {driver.User?.full_name || "N/A"} (SĐT:{" "}
                    {driver.phone})
                  </option>
                ))}
              </select>
              {availableDrivers.length === 0 && (
                <p className="text-sm text-gray-500 mt-2">
                  Không có tài xế khả dụng
                </p>
              )}
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setIsAssignDriverModalOpen(false);
                  setSelectedBus(null);
                  setSelectedDriverId("");
                }}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
              >
                Hủy
              </button>
              <button
                onClick={handleAssignDriver}
                className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded"
                disabled={!selectedDriverId}
              >
                Gán tài xế
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Modal */}
      {isNotifyModalOpen && selectedBus && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
              <Bell className="mr-2 text-purple-600" />
              Gửi thông báo cho Phụ huynh
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Xe buýt: <span className="font-semibold">{selectedBus.license_plate}</span>
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tiêu đề
                </label>
                <input
                  type="text"
                  value={notifyTitle}
                  onChange={(e) => setNotifyTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Ví dụ: Thông báo xe đến muộn"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nội dung
                </label>
                <textarea
                  value={notifyMessage}
                  onChange={(e) => setNotifyMessage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 h-32 resize-none"
                  placeholder="Nhập nội dung thông báo..."
                />
              </div>
            </div>

            <div className="flex justify-end mt-6 space-x-3">
              <button
                onClick={() => {
                  setIsNotifyModalOpen(false);
                  setSelectedBus(null);
                }}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium text-gray-700"
                disabled={sendingNotify}
              >
                Hủy
              </button>
              <button
                onClick={handleSendNotification}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium flex items-center"
                disabled={sendingNotify}
              >
                {sendingNotify ? (
                   <>
                     <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                     Đang gửi...
                   </>
                ) : (
                   "Gửi thông báo"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusesPage;