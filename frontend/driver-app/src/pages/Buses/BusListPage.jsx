// frontend/driver-app/src/pages/Buses/BusListPage.jsx

import React, { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";

const BusListPage = () => {
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Bỏ modal và các chức năng thêm/sửa/xóa cho tài xế

  const fetchBuses = async () => {
    try {
      setLoading(true);
      // Gọi API lấy xe của tài xế hiện tại
      const response = await axiosClient.get("/drivers/my/buses");
      // API trả về { success: true, data: [...] }
      const busesData = response.data?.data || [];
      setBuses(busesData);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch buses:", err);
      const errorMessage =
        err.response?.data?.message || "Không thể tải dữ liệu xe buýt.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuses();
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
        <p>Đang tải danh sách xe buýt...</p>
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
    <div className="bus-list-container">
      <header style={styles.header}>
        <h2>Xe buýt của tôi ({buses.length})</h2>
      </header>
      
      {buses.length === 0 ? (
        <div style={{ textAlign: 'center', marginTop: '50px', color: '#666' }}>
          <p>Bạn chưa được gán xe buýt nào. Vui lòng liên hệ quản trị viên.</p>
        </div>
      ) : (
        <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Biển số xe</th>
              <th style={styles.th}>Số chỗ</th>
              <th style={styles.th}>Trạng thái</th>
              <th style={styles.th}>Tuyến đường</th>
              <th style={styles.th}>Vị trí hiện tại</th>
            </tr>
          </thead>
          <tbody>
            {buses.map((bus) => (
              <tr key={bus.id} style={styles.tr}>
                <td style={styles.td}>{bus.license_plate}</td>
                <td style={styles.td}>{bus.capacity} chỗ</td>
                <td style={styles.td}>
                  <span style={styles.statusBadge(bus.status === 'ACTIVE')}>
                    {bus.status === 'ACTIVE' ? 'Hoạt động' : bus.status === 'MAINTENANCE' ? 'Bảo trì' : 'Không hoạt động'}
                  </span>
                </td>
                <td style={styles.td}>
                  {bus.CurrentRoute ? bus.CurrentRoute.route_name : 'Chưa gán tuyến'}
                </td>
                <td style={styles.td}>
                  {bus.CurrentLocation ? bus.CurrentLocation.name : 'Chưa có vị trí'}
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
// STYLES TỐI THIỂU (Tương tự StudentListPage)
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
    backgroundColor: type === "edit" ? "#007bff" : "#6c757d", // Detail/View: Gray, Edit: Blue
    color: "white",
    fontSize: "12px",
  }),
  statusBadge: (isRunning) => {
    const color = isRunning ? "#28a745" : "#dc3545"; // Xanh lá: Đang chạy, Đỏ: Dừng

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

export default BusListPage;
