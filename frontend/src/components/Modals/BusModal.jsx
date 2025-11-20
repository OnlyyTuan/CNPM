// frontend/src/components/Modals/BusModal.jsx
// Modal form cho thêm/sửa xe buýt

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';

const BusModal = ({ isOpen, onClose, bus, onSave, routes, drivers }) => {
  const [formData, setFormData] = useState({
    id: '',
    licensePlate: '',
    capacity: '',
    model: '',
    status: 'ACTIVE',
    route_id: '',
    driver_id: '',
    fuel_type: 'DIESEL',
    year_of_manufacture: new Date().getFullYear()
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (bus) {
      // Edit mode
      setFormData({
        id: bus.id || '',
        licensePlate: bus.licensePlate || bus.license_plate || '',
        capacity: bus.capacity || '',
        model: bus.model || '',
        status: bus.status || 'ACTIVE',
        route_id: bus.route_id || '',
        driver_id: bus.driver_id || '',
        fuel_type: bus.fuel_type || 'DIESEL',
        year_of_manufacture: bus.year_of_manufacture || new Date().getFullYear()
      });
    } else {
      // Add new mode
      setFormData({
        id: '',
        licensePlate: '',
        capacity: '',
        model: '',
        status: 'ACTIVE',
        route_id: '',
        driver_id: '',
        fuel_type: 'DIESEL',
        year_of_manufacture: new Date().getFullYear()
      });
    }
    setErrors({});
  }, [bus, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Xóa lỗi khi user nhập
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.licensePlate.trim()) {
      newErrors.licensePlate = 'Biển số xe không được để trống';
    } else if (!/^[0-9]{2}[A-Z]-[0-9]{4,5}$/.test(formData.licensePlate)) {
      newErrors.licensePlate = 'Biển số không đúng định dạng (VD: 51A-12345)';
    }

    if (!formData.capacity) {
      newErrors.capacity = 'Sức chứa không được để trống';
    } else if (parseInt(formData.capacity) <= 0 || parseInt(formData.capacity) > 100) {
      newErrors.capacity = 'Sức chứa phải từ 1-100 chỗ';
    }

    if (!formData.model.trim()) {
      newErrors.model = 'Model xe không được để trống';
    }

    if (!formData.year_of_manufacture) {
      newErrors.year_of_manufacture = 'Năm sản xuất không được để trống';
    } else {
      const currentYear = new Date().getFullYear();
      const year = parseInt(formData.year_of_manufacture);
      if (year < 1990 || year > currentYear) {
        newErrors.year_of_manufacture = `Năm sản xuất phải từ 1990-${currentYear}`;
      }
    }

    if (!bus && !formData.id.trim()) {
      newErrors.id = 'Mã xe buýt không được để trống';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Vui lòng kiểm tra lại thông tin');
      return;
    }

    try {
      await onSave(formData);
      onClose();
      toast.success(bus ? 'Cập nhật xe buýt thành công' : 'Thêm xe buýt thành công');
    } catch (error) {
      console.error('Lỗi khi lưu xe buýt:', error);
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">
            {bus ? 'Sửa thông tin Xe buýt' : 'Thêm Xe buýt mới'}
          </h3>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Mã xe buýt - chỉ hiển thị khi thêm mới */}
          {!bus && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mã xe buýt <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="id"
                value={formData.id}
                onChange={handleChange}
                placeholder="Ví dụ: B001"
                className={`w-full px-3 py-2 border ${errors.id ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {errors.id && <p className="text-red-500 text-xs mt-1">{errors.id}</p>}
            </div>
          )}

          {/* Biển số xe */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Biển số xe <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="licensePlate"
              value={formData.licensePlate}
              onChange={handleChange}
              placeholder="Ví dụ: 51A-12345"
              className={`w-full px-3 py-2 border ${errors.licensePlate ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {errors.licensePlate && <p className="text-red-500 text-xs mt-1">{errors.licensePlate}</p>}
          </div>

          {/* Model và Năm sản xuất */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Model <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleChange}
                placeholder="Ví dụ: Hyundai Universe"
                className={`w-full px-3 py-2 border ${errors.model ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {errors.model && <p className="text-red-500 text-xs mt-1">{errors.model}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Năm sản xuất <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="year_of_manufacture"
                value={formData.year_of_manufacture}
                onChange={handleChange}
                min="1990"
                max={new Date().getFullYear()}
                className={`w-full px-3 py-2 border ${errors.year_of_manufacture ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {errors.year_of_manufacture && <p className="text-red-500 text-xs mt-1">{errors.year_of_manufacture}</p>}
            </div>
          </div>

          {/* Sức chứa */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sức chứa <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              placeholder="Số chỗ ngồi"
              min="1"
              max="100"
              className={`w-full px-3 py-2 border ${errors.capacity ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {errors.capacity && <p className="text-red-500 text-xs mt-1">{errors.capacity}</p>}
          </div>

          {/* Loại nhiên liệu */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Loại nhiên liệu
            </label>
            <select
              name="fuel_type"
              value={formData.fuel_type}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="DIESEL">Dầu diesel</option>
              <option value="GASOLINE">Xăng</option>
              <option value="CNG">Khí nén</option>
              <option value="ELECTRIC">Điện</option>
            </select>
          </div>

          {/* Tuyến đường */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tuyến đường
            </label>
            <select
              name="route_id"
              value={formData.route_id}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Chưa phân tuyến --</option>
              {routes.map((route) => (
                <option key={route.id} value={route.id}>
                  {route.route_name || route.name} - {route.description}
                </option>
              ))}
            </select>
          </div>

          {/* Tài xế */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tài xế
            </label>
            <select
              name="driver_id"
              value={formData.driver_id}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Chưa phân công --</option>
              {drivers.map((driver) => (
                <option key={driver.id} value={driver.id}>
                  {driver.full_name} - {driver.phone}
                </option>
              ))}
            </select>
          </div>

          {/* Trạng thái */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trạng thái
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ACTIVE">Hoạt động</option>
              <option value="MAINTENANCE">Bảo trì</option>
              <option value="INACTIVE">Ngừng hoạt động</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex space-x-3 pt-6">
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
              {bus ? 'Cập nhật' : 'Thêm mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BusModal;