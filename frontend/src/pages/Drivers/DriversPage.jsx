// frontend/src/pages/Drivers/DriversPage.jsx
// Trang quản lý danh sách Tài xế

import React, { useState, useEffect } from "react";
import { Search, Plus, Edit, Trash2, Phone, Eye } from "lucide-react";
import toast from "react-hot-toast";
import {
  getAllDrivers,
  deleteDriver,
  getDriverById,
  createDriver,
  updateDriver,
} from "../../api/driverApi";
import { emitEntityChange, onEntityChange } from "../../utils/eventBus";
import CreateAccountModal from "../../components/Account/CreateAccountModal";

const DriversPage = () => {
  const [drivers, setDrivers] = useState([]);
  const [filteredDrivers, setFilteredDrivers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);

  useEffect(() => {
    fetchDrivers();
  }, []);
  // Listen for entity changes (e.g., bus assigned) and refresh drivers list
  useEffect(() => {
    const unsubscribe = onEntityChange((detail) => {
      try {
        const entity = detail && detail.entity ? detail.entity : detail;
        if (entity === "bus" || entity === "driver") {
          fetchDrivers();
        }
      } catch (e) {
        // ignore
      }
    });
    return unsubscribe;
  }, []);
  useEffect(() => {
    let filtered = drivers;

    // Debug: show current drivers and filterStatus
    // eslint-disable-next-line no-console
    console.log(
      "[DriversPage] drivers fetched:",
      drivers.length,
      drivers.map((d) => d.status)
    );
    // eslint-disable-next-line no-console
    console.log("[DriversPage] current filterStatus:", filterStatus);
    // Lọc theo tìm kiếm
    if (searchTerm) {
      filtered = filtered.filter(
        (driver) =>
          driver.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          driver.phone.includes(searchTerm) ||
          driver.license_number.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Lọc theo trạng thái — hỗ trợ nhiều biến thể của status từ backend
    const STATUS_MAP = {
      ALL: null,
      DRIVING: ["DRIVING", "driving", "ACTIVE"],
      OFF_DUTY: ["OFF_DUTY", "off_duty", "OFF-DUTY", "OFF DUTY", "OFFLINE"],
      INACTIVE: ["INACTIVE", "inactive", "IN_ACTIVE", "NOT_ACTIVE", "OFFLINE"],
    };

    const statusMatches = (driverStatus, filter) => {
      if (!filter || filter === "ALL") return true;
      const possibles = STATUS_MAP[filter] || [filter];
      // Normalize driverStatus: treat null/undefined/empty as 'INACTIVE'
      const driverStatusNormalized = driverStatus
        ? driverStatus.toString().toLowerCase()
        : "inactive";
      return possibles.some(
        (s) => s.toString().toLowerCase() === driverStatusNormalized
      );
    };

    if (filterStatus !== "ALL") {
      filtered = filtered.filter((driver) =>
        statusMatches(driver.status, filterStatus)
      );
    }

    setFilteredDrivers(filtered);
  }, [searchTerm, filterStatus, drivers]);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const data = await getAllDrivers();
      setDrivers(data);
      setFilteredDrivers(data);
    } catch (error) {
      console.error("Lỗi khi tải danh sách tài xế:", error);
      toast.error("Không thể tải danh sách tài xế: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa tài xế này?")) {
      return;
    }

    try {
      await deleteDriver(id);
      toast.success("Xóa tài xế thành công");
      fetchDrivers();
      emitEntityChange("driver");
    } catch (error) {
      console.error("Lỗi khi xóa tài xế:", error);
      toast.error("Không thể xóa tài xế: " + error.message);
    }
  };

  const handleViewDriver = (driver) => {
    setSelectedDriver(driver);
    setIsViewModalOpen(true);
  };

  const handleEditDriver = (driver) => {
    setSelectedDriver(driver);
    setIsEditModalOpen(true);
  };

  const handleUpdateDriver = async (driverData) => {
    if (!selectedDriver || !selectedDriver.id) {
      toast.error("Tài xế không hợp lệ hoặc đã bị chọn sai. Vui lòng thử lại.");
      return;
    }
    try {
      const newId = driverData.driverData?.id;
      if (newId && newId !== selectedDriver.id) {
        try {
          const existing = await getDriverById(newId);
          if (existing) {
            toast.error("Mã tài xế mới đã tồn tại. Vui lòng chọn mã khác.");
            return;
          }
        } catch (err) {
          if (!err.response || err.response.status !== 404) {
            console.error("Lỗi khi kiểm tra mã tài xế:", err);
            toast.error("Không thể kiểm tra tính duy nhất của mã tài xế");
            return;
          }
        }
      }

      await updateDriver(selectedDriver.id, driverData);
      toast.success("Cập nhật tài xế thành công!");
      setIsEditModalOpen(false);
      setSelectedDriver(null);
      fetchDrivers();
      emitEntityChange("driver");
    } catch (error) {
      console.error("Lỗi khi cập nhật tài xế:", error);
      const errorMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Không thể cập nhật tài xế";
      toast.error(errorMsg);
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Quản lý Tài xế</h2>
          <p className="text-gray-600 mt-1">
            Danh sách tất cả tài xế trong hệ thống
          </p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, số điện thoại hoặc GPLX..."
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
            <option value="DRIVING">Đang lái xe</option>
            <option value="OFF_DUTY">Nghỉ việc</option>
            <option value="INACTIVE">Không hoạt động</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Tổng số tài xế</p>
          <p className="text-2xl font-bold text-blue-600">{drivers.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Đang lái xe</p>
          <p className="text-2xl font-bold text-green-600">
            {drivers.filter((d) => d.status === "DRIVING").length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Nghỉ việc</p>
          <p className="text-2xl font-bold text-yellow-600">
            {drivers.filter((d) => d.status === "OFF_DUTY").length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Không hoạt động</p>
          <p className="text-2xl font-bold text-red-600">
            {drivers.filter((d) => d.status === "INACTIVE").length}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tài xế
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số GPLX
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số điện thoại
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Xe phụ trách
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
              {filteredDrivers.map((driver) => (
                <tr key={driver.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                        {driver.full_name.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {driver.full_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {driver.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {driver.license_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-700">
                      <Phone size={14} className="mr-1" />
                      {driver.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {driver.CurrentBus?.license_plate ||
                    driver.currentBusId ||
                    driver.current_bus_id ? (
                      <span>
                        {driver.CurrentBus?.license_plate ||
                          driver.currentBusId ||
                          driver.current_bus_id}
                      </span>
                    ) : (
                      <span className="text-gray-400">Chưa có</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${
                        driver.status === "DRIVING"
                          ? "bg-green-100 text-green-800"
                          : driver.status === "OFF_DUTY"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {driver.status === "DRIVING"
                        ? "Đang lái"
                        : driver.status === "OFF_DUTY"
                        ? "Nghỉ việc"
                        : "Không hoạt động"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewDriver(driver)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Xem chi tiết"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => handleEditDriver(driver)}
                        className="text-yellow-600 hover:text-yellow-900"
                        title="Chỉnh sửa"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(driver.id)}
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

      {filteredDrivers.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl shadow-md">
          <p className="text-gray-500">Không tìm thấy tài xế nào</p>
        </div>
      )}

      {/* Modal Xem Chi Tiết */}
      {isViewModalOpen && selectedDriver && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-full">
            <h3 className="text-xl font-bold mb-4">Chi tiết Tài xế</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Mã tài xế:
                </label>
                <p className="text-gray-900">{selectedDriver.id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Họ và tên:
                </label>
                <p className="text-gray-900">{selectedDriver.full_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Số GPLX:
                </label>
                <p className="text-gray-900">{selectedDriver.license_number}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Số điện thoại:
                </label>
                <p className="text-gray-900">{selectedDriver.phone}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Xe phụ trách:
                </label>
                <p className="text-gray-900">
                  {selectedDriver.current_bus_id || "Chưa có"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Trạng thái:
                </label>
                <p className="text-gray-900">
                  {selectedDriver.status === "DRIVING"
                    ? "Đang lái"
                    : selectedDriver.status === "OFF_DUTY"
                    ? "Nghỉ việc"
                    : "Không hoạt động"}
                </p>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => {
                  setIsViewModalOpen(false);
                  setSelectedDriver(null);
                }}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Sửa Tài xế */}
      {isEditModalOpen && selectedDriver && (
        <CreateAccountModal
          open={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedDriver(null);
          }}
          onCreated={() => {
            setIsEditModalOpen(false);
            setSelectedDriver(null);
            fetchDrivers();
          }}
          defaultRole="driver"
          initialData={selectedDriver}
        />
      )}
    </div>
  );
};

export default DriversPage;
