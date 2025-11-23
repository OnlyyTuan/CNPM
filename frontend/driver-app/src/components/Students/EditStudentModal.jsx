// frontend/admin-dashboard/src/components/Students/EditStudentModal.jsx

import React, { useEffect, useState } from "react";

const EditStudentModal = ({ isOpen, onClose, student, onSubmit }) => {
  const [formData, setFormData] = useState({
    full_name: "",
    id: "",
    class: "",
    grade: "",
    parent_contact: "",
    address: "",
    status: "WAITING",
    parent_id: null,
    assigned_bus_id: null,
    pickup_location_id: null,
    dropoff_location_id: null,
  });

  useEffect(() => {
    if (student) {
      setFormData((prev) => ({
        ...prev,
        full_name: student.full_name || student.name || "",
        id: student.id || "",
        class: student.class || student.className || "",
        grade: student.grade || "",
        parent_contact: student.parent_contact || "",
        address: student.address || "",
        status: student.status || "WAITING",
        parent_id: student.parent_id || student.Parent?.id || null,
        assigned_bus_id:
          student.assigned_bus_id || student.assignedBusId || null,
        pickup_location_id:
          student.pickup_location_id || student.pickupLocationId || null,
        dropoff_location_id:
          student.dropoff_location_id || student.dropoffLocationId || null,
      }));
    }
  }, [student]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.id) return;

    const submitData = {
      full_name: formData.full_name,
      class: formData.class,
      grade: formData.grade,
      parent_contact: formData.parent_contact,
      address: formData.address,
      status: formData.status,
      parent_id: formData.parent_id,
      assigned_bus_id: formData.assigned_bus_id,
      pickup_location_id: formData.pickup_location_id,
      dropoff_location_id: formData.dropoff_location_id,
    };

    onSubmit(formData.id, submitData);
  };

  if (!isOpen) return null;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2>Chỉnh sửa Học sinh</h2>
          <button style={styles.closeButton} onClick={onClose}>
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Tên học sinh *</label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Mã học sinh</label>
            <input
              type="text"
              name="id"
              value={formData.id}
              disabled
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Lớp *</label>
            <input
              type="text"
              name="class"
              value={formData.class}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Khối</label>
            <input
              type="text"
              name="grade"
              value={formData.grade}
              onChange={handleChange}
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Số điện thoại phụ huynh *</label>
            <input
              type="tel"
              name="parent_contact"
              value={formData.parent_contact}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Địa chỉ (điểm đón)</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Trạng thái</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              style={styles.input}
            >
              <option value="WAITING">Chờ đón</option>
              <option value="IN_BUS">Trên xe</option>
              <option value="ABSENT">Vắng mặt</option>
              <option value="ARRIVED">Đã tới</option>
            </select>
          </div>

          <div style={styles.footer}>
            <button type="button" onClick={onClose} style={styles.cancelButton}>
              Hủy
            </button>
            <button type="submit" style={styles.submitButton}>
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "white",
    borderRadius: "8px",
    width: "90%",
    maxWidth: "600px",
    maxHeight: "90vh",
    overflow: "auto",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px",
    borderBottom: "1px solid #dee2e6",
  },
  closeButton: {
    background: "none",
    border: "none",
    fontSize: "28px",
    cursor: "pointer",
    color: "#6c757d",
  },
  form: {
    padding: "20px",
  },
  formGroup: {
    marginBottom: "15px",
  },
  label: {
    display: "block",
    marginBottom: "5px",
    fontWeight: "600",
    color: "#343a40",
  },
  input: {
    width: "100%",
    padding: "10px",
    border: "1px solid #ced4da",
    borderRadius: "4px",
    fontSize: "14px",
    boxSizing: "border-box",
  },
  footer: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "20px",
    paddingTop: "20px",
    borderTop: "1px solid #dee2e6",
  },
  cancelButton: {
    padding: "10px 20px",
    border: "1px solid #6c757d",
    backgroundColor: "white",
    color: "#6c757d",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: "600",
  },
  submitButton: {
    padding: "10px 20px",
    border: "none",
    backgroundColor: "#007bff",
    color: "white",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: "600",
  },
};

export default EditStudentModal;
