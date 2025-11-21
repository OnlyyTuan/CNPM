// frontend/admin-dashboard/src/components/Students/AddStudentModal.jsx

import React, { useState } from "react";

const AddStudentModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    id: "",
    full_name: "",
    class: "",
    grade: "",
    parent_contact: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Tạo ID tự động nếu chưa có
    const submitData = {
      ...formData,
      id: formData.id || `STU${Date.now()}`,
      status: "WAITING",
    };

    onSubmit(submitData);
    // Reset form
    setFormData({
      id: "",
      full_name: "",
      class: "",
      grade: "",
      parent_contact: "",
    });
  };

  if (!isOpen) return null;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2>Thêm Học sinh mới</h2>
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
              placeholder="Nhập tên học sinh"
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
              placeholder="Ví dụ: 10A1"
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
              placeholder="Ví dụ: 10"
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
              placeholder="Ví dụ: 0912345678"
            />
          </div>

          <div style={styles.footer}>
            <button type="button" onClick={onClose} style={styles.cancelButton}>
              Hủy
            </button>
            <button type="submit" style={styles.submitButton}>
              Thêm học sinh
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
    maxWidth: "500px",
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
  textarea: {
    width: "100%",
    padding: "10px",
    border: "1px solid #ced4da",
    borderRadius: "4px",
    fontSize: "14px",
    resize: "vertical",
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
    backgroundColor: "#28a745",
    color: "white",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: "600",
  },
};

export default AddStudentModal;
