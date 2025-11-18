// frontend/admin-dashboard/src/pages/Students/StudentListPage.jsx

import React, { useEffect, useState } from "react";
import apiServices from "../../api/apiServices";
import AddStudentModal from "../../components/Students/AddStudentModal";

const StudentListPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      // Gọi API đã được bảo vệ (axiosClient sẽ tự động thêm JWT token)
      const response = await apiServices.getAllStudents();
      // API có thể trả về { data: [...] } hoặc { success: true, data: [...] }
      const studentsData = response.data?.data || response.data || [];
      setStudents(studentsData);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch students:", err);
      // Xử lý lỗi (ví dụ: 403 Forbidden nếu role không đủ, 401 nếu token hết hạn)
      const errorMessage =
        err.response?.data?.message || "Không thể tải dữ liệu học sinh.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleAddStudent = async (studentData) => {
    try {
      await apiServices.createStudent(studentData);
      setIsModalOpen(false);
      // Refresh danh sách
      fetchStudents();
      alert("Thêm học sinh thành công!");
    } catch (err) {
      console.error("Failed to add student:", err);
      const errorMessage =
        err.response?.data?.message || "Không thể thêm học sinh.";
      alert("Lỗi: " + errorMessage);
    }
  };

  // ------------------------------------------------------------------
  // HIỂN THỊ TRẠNG THÁI
  // ------------------------------------------------------------------

  if (loading) {
    return (
      <div
        className="container"
        style={{ textAlign: "center", marginTop: "50px" }}
      >
        <p>Đang tải danh sách học sinh...</p>
        {/* Thêm Spinner/Loader tại đây */}
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="container"
        style={{ color: "red", textAlign: "center", marginTop: "50px" }}
      >
        <h2>Lỗi!</h2>
        <p>{error}</p>
      </div>
    );
  }

  // ------------------------------------------------------------------
  // HIỂN THỊ DỮ LIỆU
  // ------------------------------------------------------------------

  return (
    <div className="student-list-container">
      <header style={styles.header}>
        <h2>Danh sách Học sinh ({students.length})</h2>
        {/* Nút Thêm mới */}
        <button style={styles.addButton} onClick={() => setIsModalOpen(true)}>
          + Thêm Học sinh mới
        </button>
      </header>

      <AddStudentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddStudent}
      />

      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>ID</th>
              <th style={styles.th}>Tên Học sinh</th>
              <th style={styles.th}>Lớp</th>
              <th style={styles.th}>Trạng thái</th>
              <th style={styles.th}>Xe buýt</th>
              <th style={styles.th}>Điểm đón</th>
              <th style={styles.th}>Tác vụ</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id} style={styles.tr}>
                <td style={styles.td}>{student.id}</td>
                <td style={styles.td}>
                  {student.name || student.fullName}
                </td>{" "}
                {/* Dùng name hoặc fullName */}
                <td style={styles.td}>{student.className}</td>
                <td style={styles.td}>
                  <span style={styles.statusBadge(student.status)}>
                    {student.status}
                  </span>
                </td>
                {/* Giả định rằng Student Model của bạn được JOIN với Bus, Location:
                                assignedBusId -> AssignedBus (Object)
                                pickupLocationId -> PickupLocation (Object)
                                */}
                <td style={styles.td}>
                  {student.AssignedBus
                    ? student.AssignedBus.license_plate
                    : "Chưa gán"}
                </td>
                <td style={styles.td}>
                  {student.PickupLocation ? student.PickupLocation.name : "N/A"}
                </td>
                <td style={styles.tdAction}>
                  <button style={styles.actionButton("edit")}>Sửa</button>
                  <button style={styles.actionButton("delete")}>Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ------------------------------------------------------------------
// STYLES TỐI THIỂU
// ------------------------------------------------------------------
const styles = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  addButton: {
    padding: "10px 15px",
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  tableWrapper: {
    overflowX: "auto",
    backgroundColor: "white",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    textAlign: "left",
    padding: "12px 15px",
    backgroundColor: "#f8f9fa",
    borderBottom: "2px solid #dee2e6",
    fontWeight: "600",
    color: "#343a40",
  },
  td: {
    textAlign: "left",
    padding: "12px 15px",
    borderBottom: "1px solid #dee2e6",
    color: "#495057",
  },
  tdAction: {
    padding: "12px 15px",
    borderBottom: "1px solid #dee2e6",
  },
  tr: {
    "&:hover": {
      backgroundColor: "#f1f1f1",
    },
  },
  actionButton: (type) => ({
    padding: "6px 10px",
    marginRight: "8px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    backgroundColor: type === "edit" ? "#007bff" : "#dc3545",
    color: "white",
    fontSize: "12px",
  }),
  statusBadge: (status) => {
    let color = "#6c757d"; // Default (WAITING)
    if (status === "IN_BUS") color = "#28a745";
    if (status === "ABSENT") color = "#dc3545";

    return {
      padding: "4px 8px",
      borderRadius: "12px",
      backgroundColor: color,
      color: "white",
      fontSize: "12px",
      fontWeight: "bold",
      display: "inline-block",
      minWidth: "70px",
      textAlign: "center",
    };
  },
};

export default StudentListPage;
