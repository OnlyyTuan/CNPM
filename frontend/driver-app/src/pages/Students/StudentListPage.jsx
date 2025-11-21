// frontend/driver-app/src/pages/Students/StudentListPage.jsx

import React, { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";

const StudentListPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      // Gọi API lấy học sinh trên xe của tài xế
      const response = await axiosClient.get("/drivers/my/students");
      const studentsData = response.data?.data || [];
      setStudents(studentsData);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch students:", err);
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
        <h2>Học sinh của tôi ({students.length})</h2>
      </header>

      {students.length === 0 ? (
        <div style={{ textAlign: 'center', marginTop: '50px', color: '#666' }}>
          <p>Bạn chưa có học sinh nào trên xe. Vui lòng liên hệ quản trị viên.</p>
        </div>
      ) : (
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Tên Học sinh</th>
              <th style={styles.th}>Lớp</th>
              <th style={styles.th}>Trạng thái</th>
              <th style={styles.th}>Xe buýt</th>
              <th style={styles.th}>Điểm đón</th>
              <th style={styles.th}>Điểm trả</th>
              <th style={styles.th}>Phụ huynh</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id} style={styles.tr}>
                <td style={styles.td}>{student.full_name}</td>
                <td style={styles.td}>{student.class || 'N/A'}</td>
                <td style={styles.td}>
                  <span style={styles.statusBadge(student.status)}>
                    {student.status === 'WAITING' ? 'Chờ đón' : 
                     student.status === 'IN_BUS' ? 'Trên xe' : 
                     student.status === 'ABSENT' ? 'Vắng mặt' : student.status}
                  </span>
                </td>
                <td style={styles.td}>
                  {student.bus_license_plate || 'Chưa gán'}
                </td>
                <td style={styles.td}>
                  {student.pickup_location_name || 'N/A'}
                </td>
                <td style={styles.td}>
                  {student.dropoff_location_name || 'N/A'}
                </td>
                <td style={styles.td}>
                  {student.parent_name || 'N/A'}
                  {student.parent_phone && <div style={{ fontSize: '0.85em', color: '#666' }}>{student.parent_phone}</div>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}
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
