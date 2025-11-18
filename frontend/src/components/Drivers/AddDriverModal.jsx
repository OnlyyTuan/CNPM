// frontend/src/components/Drivers/AddDriverModal.jsx

import React, { useState, useEffect } from "react";

const AddDriverModal = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    id: "",
    fullName: "",
    phone: "",
    licenseNumber: "",
    address: "",
    status: "OFF_DUTY",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id || "",
        fullName: initialData.full_name || initialData.fullName || "",
        phone: initialData.phone || "",
        licenseNumber:
          initialData.license_number || initialData.licenseNumber || "",
        address: initialData.address || "",
        status: initialData.status || "OFF_DUTY",
      });
    } else {
      setFormData((prev) => ({ ...prev, id: `DRV${Date.now()}` }));
    }
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      driverData: {
        id: formData.id,
        full_name: formData.fullName,
        phone: formData.phone,
        license_number: formData.licenseNumber,
        address: formData.address,
        status: formData.status || "OFF_DUTY",
      },
    };
    onSubmit && onSubmit(payload);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg mx-4">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="text-lg font-semibold">
            {initialData ? "Chỉnh sửa Tài xế" : "Thêm Tài xế"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Họ và tên *
            </label>
            <input
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              className="mt-1 block w-full border rounded px-2 py-1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Mã tài xế
            </label>
            <input
              name="id"
              value={formData.id}
              onChange={handleChange}
              className="mt-1 block w-full border rounded px-2 py-1"
            />
            <p className="text-xs text-gray-500 mt-1">
              Mã phải là duy nhất trong hệ thống
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Số điện thoại *
              </label>
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="mt-1 block w-full border rounded px-2 py-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Số bằng lái *
              </label>
              <input
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={handleChange}
                required
                className="mt-1 block w-full border rounded px-2 py-1"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Địa chỉ
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows={3}
              className="mt-1 block w-full border rounded px-2 py-1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Trạng thái
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="mt-1 block w-full border rounded px-2 py-1"
            >
              <option value="DRIVING">Đang lái</option>
              <option value="OFF_DUTY">Nghỉ việc</option>
              <option value="INACTIVE">Không hoạt động</option>
            </select>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded"
            >
              {initialData ? "Cập nhật" : "Thêm tài xế"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDriverModal;
