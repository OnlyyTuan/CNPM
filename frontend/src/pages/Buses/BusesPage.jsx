// frontend/src/pages/Buses/BusesPage.jsx
// Trang quản lý danh sách Xe buýt

import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Bus as BusIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { getAllBuses, deleteBus } from '../../api/busApi';
import { getAllRoutes } from '../../api/routeApi';
import { getAllDrivers } from '../../api/driverApi';
import BusModal from '../../components/Modals/BusModal';
import axios from 'axios';

const BusesPage = () => {
  const [buses, setBuses] = useState([]);
  const [filteredBuses, setFilteredBuses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBus, setSelectedBus] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [drivers, setDrivers] = useState([]);

  useEffect(() => {
    fetchBuses();
    fetchRoutes();
    fetchDrivers();
  }, []);

  useEffect(() => {
    let filtered = buses;

    // Lọc theo tìm kiếm
    if (searchTerm) {
      filtered = filtered.filter(bus =>
        bus.license_plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bus.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Lọc theo trạng thái
    if (filterStatus !== 'ALL') {
      filtered = filtered.filter(bus => bus.status === filterStatus);
    }

    setFilteredBuses(filtered);
  }, [searchTerm, filterStatus, buses]);

  const fetchBuses = async () => {
    try {
      setLoading(true);
      const data = await getAllBuses();
      console.log('Bus data:', data);
      setBuses(data);
      setFilteredBuses(data);
    } catch (error) {
      console.error('Lỗi khi tải danh sách xe buýt:', error);
      toast.error('Không thể tải danh sách xe buÿt: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoutes = async () => {
    try {
      const response = await getAllRoutes();
      if (response.success) {
        setRoutes(response.data);
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách tuyến đường:', error);
    }
  };

  const fetchDrivers = async () => {
    try {
      const response = await getAllDrivers();
      if (response.success) {
        setDrivers(response.data);
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách tài xế:', error);
    }
  };

  const handleAddBus = () => {
    setSelectedBus(null);
    setModalOpen(true);
  };

  const handleEditBus = (bus) => {
    setSelectedBus(bus);
    setModalOpen(true);
  };

  const handleSaveBus = async (formData) => {
    try {
      if (selectedBus) {
        // Update existing bus
        await axios.put(`http://localhost:5000/api/v1/buses/${selectedBus.id}`, formData);
      } else {
        // Create new bus
        await axios.post('http://localhost:5000/api/v1/buses', formData);
      }
      fetchBuses();
    } catch (error) {
      throw error;
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa xe buýt này?')) {
      return;
    }

    try {
      await deleteBus(id);
      toast.success('Xóa xe buýt thành công');
      fetchBuses();
    } catch (error) {
      console.error('Lỗi khi xóa xe buýt:', error);
      toast.error('Không thể xóa xe buýt: ' + error.message);
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
          <h2 className="text-3xl font-bold text-gray-900">Quản lý Xe buýt</h2>
          <p className="text-gray-600 mt-1">Danh sách tất cả xe buýt trong hệ thống</p>
        </div>
        <button 
          onClick={handleAddBus}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
        >
          <Plus size={20} />
          <span>Thêm Xe buýt</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Tổng số xe</p>
          <p className="text-2xl font-bold text-blue-600">{buses.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Đang hoạt động</p>
          <p className="text-2xl font-bold text-green-600">
            {buses.filter(b => b.status === 'ACTIVE').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Đang bảo trì</p>
          <p className="text-2xl font-bold text-yellow-600">
            {buses.filter(b => b.status === 'MAINTENANCE').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Không hoạt động</p>
          <p className="text-2xl font-bold text-red-600">
            {buses.filter(b => b.status === 'INACTIVE').length}
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
                  Xe buýt
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sức chứa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tài xế
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
                        <div className="text-sm font-medium text-gray-900">{bus.license_plate}</div>
                        <div className="text-sm text-gray-500">ID: {bus.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{bus.capacity} chỗ</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {bus.driver_id || <span className="text-gray-400">Chưa có</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {bus.route_id || <span className="text-gray-400">Chưa có</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${bus.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                        bus.status === 'MAINTENANCE' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'}`}>
                      {bus.status === 'ACTIVE' ? 'Hoạt động' :
                       bus.status === 'MAINTENANCE' ? 'Bảo trì' : 'Không hoạt động'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleEditBus(bus)}
                        className="text-yellow-600 hover:text-yellow-900" 
                        title="Chỉnh sửa"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteBus(bus.id)}
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

      {/* Bus Modal */}
      <BusModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        bus={selectedBus}
        onSave={handleSaveBus}
        routes={routes}
        drivers={drivers}
      />
    </div>
  );
};

export default BusesPage;
