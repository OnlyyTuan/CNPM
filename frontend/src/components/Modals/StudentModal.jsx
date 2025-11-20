// frontend/src/components/Modals/StudentModal.jsx
// Modal form cho thêm/sửa học sinh

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const StudentModal = ({ isOpen, onClose, student, onSave, buses }) => {
  const [formData, setFormData] = useState({
    id: '',
    full_name: '',
    class: '',
    grade: '',
    parent_contact: '',
    pickup_location_id: null,
    dropoff_location_id: null,
    assigned_bus_id: null,
    parent_id: null,
    status: 'WAITING'
  });

  const [errors, setErrors] = useState({});
  const [existingStudents, setExistingStudents] = useState([]);

  useEffect(() => {
    if (isOpen) {
      // Fetch existing students for duplicate checking
      fetchExistingStudents();
    }
    
    if (student) {
      // Edit mode
      setFormData({
        id: student.id || '',
        full_name: student.full_name || '',
        class: student.class || '',
        grade: student.grade || '',
        parent_contact: student.parent_contact || '',
        pickup_location_id: student.pickup_location_id || null,
        dropoff_location_id: student.dropoff_location_id || null,
        assigned_bus_id: student.assigned_bus_id || null,
        parent_id: student.parent_id || null,
        status: student.status || 'WAITING'
      });
    } else {
      // Add new mode
      setFormData({
        id: '',
        full_name: '',
        class: '',
        grade: '',
        parent_contact: '',
        pickup_location_id: null,
        dropoff_location_id: null,
        assigned_bus_id: null,
        parent_id: null,
        status: 'WAITING'
      });
    }
    setErrors({});
  }, [student, isOpen]);

  const fetchExistingStudents = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/v1/students');
      if (response.data.success) {
        setExistingStudents(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

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

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Họ tên không được để trống';
    }

    if (!formData.class.trim()) {
      newErrors.class = 'Lớp không được để trống';
    }

    if (!formData.grade.trim()) {
      newErrors.grade = 'Khối không được để trống';
    }

    if (!formData.parent_contact.trim()) {
      newErrors.parent_contact = 'Số điện thoại phụ huynh không được để trống';
    } else if (!/^[0-9]{10,11}$/.test(formData.parent_contact)) {
      newErrors.parent_contact = 'Số điện thoại phải là 10-11 chữ số';
    }

    if (!student && !formData.id.trim()) {
      newErrors.id = 'Mã học sinh không được để trống';
    } else if (!student && !/^S[0-9]{3,}$/.test(formData.id)) {
      newErrors.id = 'Mã học sinh phải có định dạng S001, S002...';
    } else if (!student && existingStudents.some(s => s.id === formData.id)) {
      newErrors.id = 'Mã học sinh đã tồn tại, vui lòng chọn mã khác';
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
      toast.success(student ? 'Cập nhật học sinh thành công' : 'Thêm học sinh thành công');
    } catch (error) {
      console.error('Lỗi khi lưu học sinh:', error);
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">
            {student ? 'Sửa thông tin Học sinh' : 'Thêm Học sinh mới'}
          </h3>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Mã học sinh - chỉ hiển thị khi thêm mới */}
          {!student && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mã học sinh <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="id"
                value={formData.id}
                onChange={handleChange}
                placeholder="Ví dụ: S001"
                className={`w-full px-3 py-2 border ${errors.id ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {errors.id && <p className="text-red-500 text-xs mt-1">{errors.id}</p>}
            </div>
          )}

          {/* Họ và tên */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Họ và tên <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="Nhập họ và tên học sinh"
              className={`w-full px-3 py-2 border ${errors.full_name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name}</p>}
          </div>

          {/* Lớp và Khối */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lớp <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="class"
                value={formData.class}
                onChange={handleChange}
                placeholder="Ví dụ: 10A1"
                className={`w-full px-3 py-2 border ${errors.class ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {errors.class && <p className="text-red-500 text-xs mt-1">{errors.class}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Khối <span className="text-red-500">*</span>
              </label>
              <select
                name="grade"
                value={formData.grade}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${errors.grade ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <option value="">-- Chọn khối --</option>
                <option value="6">Khối 6</option>
                <option value="7">Khối 7</option>
                <option value="8">Khối 8</option>
                <option value="9">Khối 9</option>
                <option value="10">Khối 10</option>
                <option value="11">Khối 11</option>
                <option value="12">Khối 12</option>
              </select>
              {errors.grade && <p className="text-red-500 text-xs mt-1">{errors.grade}</p>}
            </div>
          </div>

          {/* Số điện thoại phụ huynh */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Số điện thoại phụ huynh <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="parent_contact"
              value={formData.parent_contact}
              onChange={handleChange}
              placeholder="Ví dụ: 0901234567"
              className={`w-full px-3 py-2 border ${errors.parent_contact ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {errors.parent_contact && <p className="text-red-500 text-xs mt-1">{errors.parent_contact}</p>}
          </div>

          {/* Xe buýt được phân công */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Xe buýt
            </label>
            <select
              name="assigned_bus_id"
              value={formData.assigned_bus_id || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Chưa phân công --</option>
              {buses && buses.length > 0 ? buses.map((bus) => (
                <option key={bus.id} value={bus.id}>
                  {bus.license_plate} - {bus.capacity} chỗ
                </option>
              )) : (
                <option disabled>Không có xe buýt nào</option>
              )}
            </select>
            {(!buses || buses.length === 0) && (
              <p className="text-yellow-500 text-xs mt-1">Lưu ý: Chưa có xe buýt nào trong hệ thống</p>
            )}
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
              <option value="WAITING">Đang chờ</option>
              <option value="IN_BUS">Trên xe</option>
              <option value="ABSENT">Vắng mặt</option>
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
              {student ? 'Cập nhật' : 'Thêm mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentModal;