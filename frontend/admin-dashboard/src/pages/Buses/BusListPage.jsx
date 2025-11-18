// frontend/admin-dashboard/src/pages/Buses/BusListPage.jsx

import React, { useEffect, useState } from "react";
import apiServices from "../../api/apiServices";
import AddBusModal from "../../components/Buses/AddBusModal";

const BusListPage = () => {
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchBuses = async () => {
    try {
      setLoading(true);
      // Gọi API đã được bảo vệ
      const response = await apiServices.getAllBuses();
      // API có thể trả về { data: [...] } hoặc array trực tiếp
      const busesData = response.data?.data || response.data || [];
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

  const handleAddBus = async (busData) => {
    try {
      await apiServices.createBus(busData);
      setIsModalOpen(false);
      // Refresh danh sách
      fetchBuses();
      alert("Thêm xe buýt thành công!");
    } catch (err) {
      console.error("Failed to add bus:", err);
      const errorMessage =
        err.response?.data?.message || "Không thể thêm xe buýt.";
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
        <h2>Danh sách Xe buýt ({buses.length})</h2>
        {/* Nút Thêm mới */}
        <button style={styles.addButton} onClick={() => setIsModalOpen(true)}>
          + Thêm Xe buýt mới
        </button>
      </header>
      <AddBusModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddBus}
      />{" "}
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Biển số xe</th>
              <th style={styles.th}>Tài xế</th>
              <th style={styles.th}>Số chỗ</th>
              <th style={styles.th}>Trạng thái</th>
              <th style={styles.th}>Tuyển đường gán</th>
              <th style={styles.th}>Tác vụ</th>
            </tr>
          </thead>
          <tbody>
            {buses.map((bus) => (
              <tr key={bus.id} style={styles.tr}>
                <td style={styles.td}>{bus.license_plate}</td>
                {/* Giả định Bus Model được JOIN với Driver và Route */}
                <td style={styles.td}>
                  {bus.Driver ? bus.Driver.fullName : "Chưa gán"}
                </td>
                <td style={styles.td}>{bus.capacity}</td>
                <td style={styles.td}>
                  <span style={styles.statusBadge(bus.is_running)}>
                    {bus.is_running ? "Đang chạy" : "Dừng"}
                  </span>
                </td>
                <td style={styles.td}>{bus.Route ? bus.Route.name : "N/A"}</td>
                <td style={styles.tdAction}>
                  <button style={styles.actionButton("edit")}>Sửa</button>
                  <button style={styles.actionButton("detail")}>
                    Chi tiết
                  </button>
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
