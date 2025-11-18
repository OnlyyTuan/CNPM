// frontend/src/components/Buses/AddBusModal.jsx

import React, { useState, useEffect } from "react";

const AddBusModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  availableDrivers = [],
}) => {
  const [formData, setFormData] = useState({
    license_plate: "",
    capacity: "",
    model: "",
    status: "ACTIVE",
    driver_id: "",
  });

  // Cập nhật form khi có initialData (chế độ sửa)
  useEffect(() => {
    if (initialData) {
      setFormData({
        license_plate: initialData.license_plate || "",
        capacity: initialData.capacity || "",
        model: initialData.model || "",
        status: initialData.status || "ACTIVE",
        driver_id: initialData.driver_id || "",
      });
    } else {
      setFormData({
        license_plate: "",
        capacity: "",
        model: "",
        status: "ACTIVE",
        driver_id: "",
      });
    }
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Nếu là chế độ sửa (có initialData)
    if (initialData) {
      const submitData = {
        license_plate: formData.license_plate,
        capacity: parseInt(formData.capacity),
        status: formData.status,
        driver_id: formData.driver_id || null,
      };
      onSubmit(submitData);
    } else {
      // Chế độ thêm mới
      const submitData = {
        id: `B${Date.now()}`,
        license_plate: formData.license_plate,
        capacity: parseInt(formData.capacity),
        status: "ACTIVE",
        driver_id: formData.driver_id || null,
      };
      onSubmit(submitData);
      // Reset form
      setFormData({
        license_plate: "",
        capacity: "",
        model: "",
        status: "ACTIVE",
        driver_id: "",
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{initialData ? "Chỉnh sửa Xe buýt" : "Thêm Xe buýt mới"}</h2>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Biển số xe *</label>
            <input
              type="text"
              name="license_plate"
              value={formData.license_plate}
              onChange={handleChange}
              required
              placeholder="Ví dụ: 29A-12345"
            />
          </div>

          <div className="form-group">
            <label>Số chỗ ngồi *</label>
            <input
              type="number"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              required
              min="1"
              placeholder="Ví dụ: 45"
            />
          </div>

          {initialData && (
            <div className="form-group">
              <label>Trạng thái</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              >
                <option value="ACTIVE">Hoạt động</option>
                <option value="MAINTENANCE">Bảo trì</option>
                <option value="INACTIVE">Không hoạt động</option>
              </select>
            </div>
          )}

          {/* driver select removed as requested */}

          <div className="form-group">
            <label>Model xe</label>
            <input
              type="text"
              name="model"
              value={formData.model}
              onChange={handleChange}
              placeholder="Ví dụ: Hyundai Universe"
            />
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-cancel">
              Hủy
            </button>
            <button type="submit" className="btn-submit">
              {initialData ? "Cập nhật" : "Thêm xe buýt"}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        .modal-container {
          background-color: white;
          border-radius: 8px;
          width: 90%;
          max-width: 500px;
          max-height: 90vh;
          overflow: auto;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #dee2e6;
        }
        .close-btn {
          background: none;
          border: none;
          font-size: 28px;
          cursor: pointer;
          color: #6c757d;
        }
        .modal-form {
          padding: 20px;
        }
        .form-group {
          margin-bottom: 15px;
        }
        .form-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: 600;
          color: #343a40;
        }
        .form-group input {
          width: 100%;
          padding: 10px;
          border: 1px solid #ced4da;
          border-radius: 4px;
          font-size: 14px;
          box-sizing: border-box;
        }
        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #dee2e6;
        }
        .btn-cancel {
          padding: 10px 20px;
          border: 1px solid #6c757d;
          background-color: white;
          color: #6c757d;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 600;
        }
        .btn-submit {
          padding: 10px 20px;
          border: none;
          background-color: #28a745;
          color: white;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};

export default AddBusModal;
