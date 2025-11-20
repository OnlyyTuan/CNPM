// frontend/src/pages/Routes/RoutesPage.jsx
// Trang quản lý danh sách Tuyến đường

import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, GitBranch, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { getAllRoutes } from '../../api/routeApi';

const RoutesPage = () => {
  const [routes, setRoutes] = useState([]);
  const [filteredRoutes, setFilteredRoutes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoutes();
  }, []);

  useEffect(() => {
    // Tìm kiếm tuyến đường
    const filtered = routes.filter(route =>
      route.route_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRoutes(filtered);
  }, [searchTerm, routes]);

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      const response = await getAllRoutes();
      if (response.success) {
        setRoutes(response.data);
        setFilteredRoutes(response.data);
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách tuyến đường:', error);
      toast.error('Không thể tải danh sách tuyến đường');
      // Mock data for development
      const mockData = [
        { id: '1', route_name: 'Tuyến 1: Trung tâm - Quận 9', distance: 15.5, estimated_duration: 45 },
        { id: '2', route_name: 'Tuyến 2: Bình Thạnh - Thủ Đức', distance: 12.3, estimated_duration: 35 },
      ];
      setRoutes(mockData);
      setFilteredRoutes(mockData);
      setLoading(false);
    } finally {
      setLoading(false);
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
          <h2 className="text-3xl font-bold text-gray-900">Quản lý Tuyến đường</h2>
          <p className="text-gray-600 mt-1">Danh sách tất cả tuyến đường trong hệ thống</p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md">
          <Plus size={20} />
          <span>Thêm Tuyến đường</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên tuyến hoặc mã..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Tổng số tuyến</p>
          <p className="text-2xl font-bold text-blue-600">{routes.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Tổng quãng đường</p>
          <p className="text-2xl font-bold text-green-600">
            {routes.reduce((sum, r) => sum + (r.distance || 0), 0).toFixed(1)} km
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Thời gian trung bình</p>
          <p className="text-2xl font-bold text-orange-600">
            {routes.length > 0 
              ? Math.round(routes.reduce((sum, r) => sum + (r.estimated_duration || 0), 0) / routes.length)
              : 0} phút
          </p>
        </div>
      </div>

      {/* Routes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRoutes.map((route) => (
          <div key={route.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <GitBranch size={24} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{route.route_name}</h3>
                    <p className="text-sm text-gray-500">ID: {route.id}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin size={16} className="mr-2 text-gray-400" />
                  <span>Quãng đường: <strong className="text-gray-900">{route.distance || 'N/A'} km</strong></span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Thời gian: <strong className="text-gray-900">{route.estimated_duration || 'N/A'} phút</strong></span>
                </div>
              </div>

              <div className="mt-6 flex space-x-2">
                <button className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                  <Edit size={16} />
                  <span>Sửa</span>
                </button>
                <button className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
                  <Trash2 size={16} />
                  <span>Xóa</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredRoutes.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl shadow-md">
          <GitBranch size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">Không tìm thấy tuyến đường nào</p>
        </div>
      )}
    </div>
  );
};

export default RoutesPage;
