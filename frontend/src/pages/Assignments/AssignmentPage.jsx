// frontend/src/pages/Assignments/AssignmentPage.jsx
// Trang phân công tài xế và xe buýt cho tuyến đường

import React, { useState, useEffect } from 'react';
import { Bus, UserCog, GitBranch, Plus, X, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getAllAssignments,
  getAvailableForAssignment,
  assignDriverToBus,
  assignBusToRoute,
  unassignDriver,
} from '../../api/assignmentApi';

// Component Modal phân công tài xế cho xe
const AssignDriverModal = ({ isOpen, onClose, drivers, buses, onAssign }) => {
  const [selectedDriver, setSelectedDriver] = useState('');
  const [selectedBus, setSelectedBus] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedDriver && selectedBus) {
      onAssign(selectedDriver, selectedBus);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">Phân công Tài xế cho Xe</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Chọn Tài xế <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedDriver}
              onChange={(e) => setSelectedDriver(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">-- Chọn tài xế --</option>
              {drivers.map((driver) => (
                <option key={driver.id} value={driver.id}>
                  {driver.full_name} - {driver.phone}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Chọn Xe buýt <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedBus}
              onChange={(e) => setSelectedBus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">-- Chọn xe buýt --</option>
              {buses.map((bus) => (
                <option key={bus.id} value={bus.id}>
                  {bus.license_plate} - {bus.capacity} chỗ
                </option>
              ))}
            </select>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Phân công
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Component Modal phân công xe cho tuyến
const AssignBusToRouteModal = ({ isOpen, onClose, buses, routes, onAssign }) => {
  const [selectedBus, setSelectedBus] = useState('');
  const [selectedRoute, setSelectedRoute] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedBus && selectedRoute) {
      onAssign(selectedBus, selectedRoute);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">Phân công Xe cho Tuyến đường</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Chọn Xe buýt <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedBus}
              onChange={(e) => setSelectedBus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">-- Chọn xe buýt --</option>
              {buses.map((bus) => (
                <option key={bus.id} value={bus.id}>
                  {bus.license_plate} - {bus.capacity} chỗ
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Chọn Tuyến đường <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedRoute}
              onChange={(e) => setSelectedRoute(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">-- Chọn tuyến đường --</option>
              {routes.map((route) => (
                <option key={route.id} value={route.id}>
                  {route.route_name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Phân công
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AssignmentPage = () => {
  const [assignments, setAssignments] = useState([]);
  const [availableData, setAvailableData] = useState({
    availableDrivers: [],
    availableBuses: [],
    routes: [],
  });
  const [loading, setLoading] = useState(true);
  const [driverModalOpen, setDriverModalOpen] = useState(false);
  const [routeModalOpen, setRouteModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [assignmentsRes, availableRes] = await Promise.all([
        getAllAssignments(),
        getAvailableForAssignment(),
      ]);

      if (assignmentsRes.success) {
        setAssignments(assignmentsRes.data);
      }

      if (availableRes.success) {
        setAvailableData(availableRes.data);
      }
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu:', error);
      toast.error('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  // Xử lý phân công tài xế cho xe
  const handleAssignDriver = async (driverId, busId) => {
    try {
      const response = await assignDriverToBus(driverId, busId);
      if (response.success) {
        toast.success('Phân công tài xế thành công');
        setDriverModalOpen(false);
        fetchData();
      }
    } catch (error) {
      console.error('Lỗi khi phân công tài xế:', error);
      toast.error(error.response?.data?.message || 'Không thể phân công tài xế');
    }
  };

  // Xử lý phân công xe cho tuyến
  const handleAssignBusToRoute = async (busId, routeId) => {
    try {
      const response = await assignBusToRoute(busId, routeId);
      if (response.success) {
        toast.success('Phân công xe cho tuyến thành công');
        setRouteModalOpen(false);
        fetchData();
      }
    } catch (error) {
      console.error('Lỗi khi phân công xe cho tuyến:', error);
      toast.error(error.response?.data?.message || 'Không thể phân công xe cho tuyến');
    }
  };

  // Xử lý hủy phân công tài xế
  const handleUnassignDriver = async (driverId) => {
    if (!window.confirm('Bạn có chắc muốn hủy phân công tài xế này?')) {
      return;
    }

    try {
      const response = await unassignDriver(driverId);
      if (response.success) {
        toast.success('Hủy phân công thành công');
        fetchData();
      }
    } catch (error) {
      console.error('Lỗi khi hủy phân công:', error);
      toast.error(error.response?.data?.message || 'Không thể hủy phân công');
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
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Phân công Tài xế và Xe buýt</h2>
        <p className="text-gray-600 mt-1">Quản lý phân công tài xế, xe buýt và tuyến đường</p>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <button
          onClick={() => setDriverModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
        >
          <Plus size={20} />
          <span>Phân công Tài xế cho Xe</span>
        </button>
        <button
          onClick={() => setRouteModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md"
        >
          <Plus size={20} />
          <span>Phân công Xe cho Tuyến</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <UserCog size={24} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Tài xế chưa phân công</p>
              <p className="text-2xl font-bold text-gray-900">{availableData.availableDrivers.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <Bus size={24} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Xe buýt chưa có tài xế</p>
              <p className="text-2xl font-bold text-gray-900">{availableData.availableBuses.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <GitBranch size={24} className="text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Tổng số tuyến đường</p>
              <p className="text-2xl font-bold text-gray-900">{availableData.routes.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Assignments Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">Danh sách Phân công hiện tại</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Xe buýt
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
              {assignments.map((assignment) => (
                <tr key={assignment.bus_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Bus size={20} className="text-blue-600 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {assignment.license_plate}
                        </div>
                        <div className="text-sm text-gray-500">
                          {assignment.capacity} chỗ
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {assignment.driver_name || <span className="text-gray-400">Chưa có</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {assignment.driver_phone || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {assignment.route_name || <span className="text-gray-400">Chưa có</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${assignment.bus_status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                        assignment.bus_status === 'MAINTENANCE' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'}`}>
                      {assignment.bus_status === 'ACTIVE' ? 'Hoạt động' :
                       assignment.bus_status === 'MAINTENANCE' ? 'Bảo trì' :
                       'Không hoạt động'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {assignment.driver_id && (
                      <button
                        onClick={() => handleUnassignDriver(assignment.driver_id)}
                        className="text-red-600 hover:text-red-900 flex items-center space-x-1"
                      >
                        <Trash2 size={16} />
                        <span>Hủy phân công</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <AssignDriverModal
        isOpen={driverModalOpen}
        onClose={() => setDriverModalOpen(false)}
        drivers={availableData.availableDrivers}
        buses={availableData.availableBuses}
        onAssign={handleAssignDriver}
      />

      <AssignBusToRouteModal
        isOpen={routeModalOpen}
        onClose={() => setRouteModalOpen(false)}
        buses={assignments.filter(a => a.driver_id).map(a => ({ id: a.bus_id, license_plate: a.license_plate, capacity: a.capacity }))}
        routes={availableData.routes}
        onAssign={handleAssignBusToRoute}
      />
    </div>
  );
};

export default AssignmentPage;
