// frontend/src/pages/Drivers/DriversPage.jsx
// Trang quản lý danh sách Tài xế

import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Phone } from 'lucide-react';
import toast from 'react-hot-toast';
import { getAllDrivers, deleteDriver } from '../../api/driverApi';

const DriversPage = () => {
  const [drivers, setDrivers] = useState([]);
  const [filteredDrivers, setFilteredDrivers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDrivers();
  }, []);

  useEffect(() => {
    let filtered = drivers;

    // Lọc theo tìm kiếm
    if (searchTerm) {
      filtered = filtered.filter(driver =>
        driver.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        driver.phone.includes(searchTerm) ||
        driver.license_number.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Lọc theo trạng thái
    if (filterStatus !== 'ALL') {
      filtered = filtered.filter(driver => driver.status === filterStatus);
    }

    setFilteredDrivers(filtered);
  }, [searchTerm, filterStatus, drivers]);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const response = await getAllDrivers();
      if (response.success) {
        setDrivers(response.data);
        setFilteredDrivers(response.data);
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách tài xế:', error);
      toast.error('Không thể tải danh sách tài xế');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa tài xế này?')) {
      return;
    }

    try {
      const response = await deleteDriver(id);
      if (response.success) {
        toast.success('Xóa tài xế thành công');
        fetchDrivers();
      }
    } catch (error) {
      console.error('Lỗi khi xóa tài xế:', error);
      toast.error(error.response?.data?.message || 'Không thể xóa tài xế');
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
          <p className="text-gray-600 mt-1">Danh sách tất cả tài xế trong hệ thống</p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md">
          <Plus size={20} />
          <span>Thêm Tài xế</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
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
            {drivers.filter(d => d.status === 'DRIVING').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Nghỉ việc</p>
          <p className="text-2xl font-bold text-yellow-600">
            {drivers.filter(d => d.status === 'OFF_DUTY').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Không hoạt động</p>
          <p className="text-2xl font-bold text-red-600">
            {drivers.filter(d => d.status === 'INACTIVE').length}
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
                        <div className="text-sm font-medium text-gray-900">{driver.full_name}</div>
                        <div className="text-sm text-gray-500">ID: {driver.id}</div>
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
                    {driver.current_bus_id || <span className="text-gray-400">Chưa có</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${driver.status === 'DRIVING' ? 'bg-green-100 text-green-800' :
                        driver.status === 'OFF_DUTY' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'}`}>
                      {driver.status === 'DRIVING' ? 'Đang lái' :
                       driver.status === 'OFF_DUTY' ? 'Nghỉ việc' : 'Không hoạt động'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-yellow-600 hover:text-yellow-900" title="Chỉnh sửa">
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
    </div>
  );
};

export default DriversPage;
