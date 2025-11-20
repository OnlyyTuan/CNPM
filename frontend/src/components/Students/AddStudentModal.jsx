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
    assigned_bus_id: "",
    pickup_location_id: "",
    dropoff_location_id: "",
  });

  const [buses, setBuses] = useState([]);
  const [locations, setLocations] = useState([]);

  // Lấy danh sách xe buýt
  useEffect(() => {
    const fetchBuses = async () => {
      try {
        console.log('[AddStudentModal] Fetching buses from API...');
        const response = await fetch("http://localhost:3000/api/v1/buses");
        const data = await response.json();
        console.log('[AddStudentModal] Buses response:', data);
        if (data.success) {
          setBuses(data.data);
          console.log('[AddStudentModal] Buses loaded:', data.data.length);
        }
      } catch (error) {
        console.error("Lỗi khi tải danh sách xe buýt:", error);
      }
    };
    if (isOpen) {
      console.log('[AddStudentModal] Modal opened, fetching buses...');
      fetchBuses();
    }
  }, [isOpen]);

  // Lấy danh sách điểm dừng khi chọn xe buýt
  useEffect(() => {
    const fetchLocations = async () => {
      if (!formData.assigned_bus_id) {
        setLocations([]);
        return;
      }
      try {
        console.log('[AddStudentModal] Fetching locations for bus:', formData.assigned_bus_id);
        const response = await fetch(
          `http://localhost:3000/api/v1/students/bus/${formData.assigned_bus_id}/stops`
        );
        const data = await response.json();
        console.log('[AddStudentModal] Locations response:', data);
        if (data.success) {
          setLocations(data.data);
          console.log('[AddStudentModal] Locations loaded:', data.data.length);
        }
      } catch (error) {
        console.error("Lỗi khi tải danh sách điểm dừng:", error);
      }
    };
    fetchLocations();
  }, [formData.assigned_bus_id]);

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
        assigned_bus_id: initialData.assigned_bus_id || "",
        pickup_location_id: initialData.pickup_location_id || "",
        dropoff_location_id: initialData.dropoff_location_id || "",
      });
    } else {
      setFormData({
        id: `STU${Date.now()}`,
        full_name: "",
        class: "",
        grade: "",
        parent_contact: "",
        address: "",
        assigned_bus_id: "",
        pickup_location_id: "",
        dropoff_location_id: "",
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
        assigned_bus_id: "",
        pickup_location_id: "",
        dropoff_location_id: "",
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
            <label>Địa chỉ</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Ví dụ: Số 1, Đường ABC, Quận X"
            />
          </div>

          <div className="form-group">
            <label>Xe buýt</label>
            <select
              name="assigned_bus_id"
              value={formData.assigned_bus_id}
              onChange={handleChange}
              className="form-select"
            >
              <option value="">-- Chọn xe buýt --</option>
              {buses.map((bus) => (
                <option key={bus.id} value={bus.id}>
                  {bus.id} - {bus.license_plate}
                </option>
              ))}
            </select>
          </div>

          {formData.assigned_bus_id && (
            <>
              <div className="form-group">
                <label>Điểm đón *</label>
                <select
                  name="pickup_location_id"
                  value={formData.pickup_location_id}
                  onChange={handleChange}
                  required={!!formData.assigned_bus_id}
                  className="form-select"
                >
                  <option value="">-- Chọn điểm đón --</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Điểm trả *</label>
                <select
                  name="dropoff_location_id"
                  value={formData.dropoff_location_id}
                  onChange={handleChange}
                  required={!!formData.assigned_bus_id}
                  className="form-select"
                >
                  <option value="">-- Chọn điểm trả --</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

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
        .form-group input,
        .form-group select,
        .form-select {
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
