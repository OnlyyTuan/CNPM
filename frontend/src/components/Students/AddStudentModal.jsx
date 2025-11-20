// frontend/src/components/Students/AddStudentModal.jsx

import React, { useState, useEffect } from "react";

const AddStudentModal = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    id: "",
    full_name: "",
    class: "",
    grade: "",
    parent_contact: "",
    address: "",
  });

  // Cập nhật form khi có initialData (chế độ sửa)
  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id || "",
        full_name: initialData.full_name || "",
        class: initialData.class || "",
        grade: initialData.grade || "",
        parent_contact: initialData.parent_contact || "",
        address: initialData.address || "",
      });
    } else {
      setFormData({
        id: `STU${Date.now()}`,
        full_name: "",
        class: "",
        grade: "",
        parent_contact: "",
        address: "",
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

    // Nếu là chế độ sửa (có initialData), giữ nguyên ID
    const submitData = initialData
      ? {
          ...formData,
          status: formData.status || "WAITING",
        }
      : {
          ...formData,
          id: formData.id || `S${Date.now()}`,
          status: "WAITING",
        };

    onSubmit(submitData);

    // Reset form
    if (!initialData) {
      setFormData({
        id: `STU${Date.now()}`,
        full_name: "",
        class: "",
        grade: "",
        parent_contact: "",
        address: "",
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{initialData ? "Chỉnh sửa Học sinh" : "Thêm Học sinh mới"}</h2>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Tên học sinh *</label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              required
              placeholder="Nhập tên học sinh"
            />
          </div>

          {/* Hiển thị Mã học sinh (có thể sửa) */}
          <div className="form-group">
            <label>Mã học sinh</label>
            <input
              type="text"
              name="id"
              value={formData.id}
              onChange={handleChange}
              required
              placeholder="Ví dụ: STU123456789"
            />
            <small className="text-gray-500">
              Mã sẽ được gửi kèm khi tạo học sinh
            </small>
          </div>

          <div className="form-group">
            <label>Lớp *</label>
            <input
              type="text"
              name="class"
              value={formData.class}
              onChange={handleChange}
              required
              placeholder="Ví dụ: 10A1"
            />
          </div>

          <div className="form-group">
            <label>Khối</label>
            <input
              type="text"
              name="grade"
              value={formData.grade}
              onChange={handleChange}
              placeholder="Ví dụ: 10"
            />
          </div>

          <div className="form-group">
            <label>Số điện thoại phụ huynh *</label>
            <input
              type="tel"
              name="parent_contact"
              value={formData.parent_contact}
              onChange={handleChange}
              required
              placeholder="Ví dụ: 0912345678"
            />
          </div>

          <div className="form-group">
            <label>Địa chỉ (điểm đón)</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Ví dụ: Số 1, Đường ABC, Quận X"
            />
            <small className="text-gray-500">
              Địa chỉ để xe buýt có thể đến đón
            </small>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-cancel">
              Hủy
            </button>
            <button type="submit" className="btn-submit">
              {initialData ? "Cập nhật" : "Thêm học sinh"}
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

export default AddStudentModal;
