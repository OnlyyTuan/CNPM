// frontend/admin-dashboard/src/pages/Drivers/DriverListPage.jsx

import React, { useEffect, useState } from "react";
import apiServices from "../../api/apiServices";
import CreateAccountModal from "../../../../src/components/Account/CreateAccountModal";

const DriverListPage = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      // Gọi API đã được bảo vệ
      const response = await apiServices.getAllDrivers();
      // API có thể trả về { data: [...] } hoặc array trực tiếp
      const driversData = response.data?.data || response.data || [];
      setDrivers(driversData);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch drivers:", err);
      const errorMessage =
        err.response?.data?.message || "Không thể tải dữ liệu tài xế.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const handleAddDriver = async (driverData) => {
    try {
      await apiServices.createDriver(driverData);
      setIsModalOpen(false);
      // Refresh danh sách
      fetchDrivers();
      alert("Thêm tài xế thành công!");
    } catch (err) {
      console.error("Failed to add driver:", err);
      const errorMessage =
        err.response?.data?.message || "Không thể thêm tài xế.";
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
        <p>Đang tải danh sách tài xế...</p>
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
    <div className="driver-list-container">
      <header style={styles.header}>
        <h2>Danh sách Tài xế ({drivers.length})</h2>
        {/* Nút Thêm mới */}
        <button style={styles.addButton} onClick={() => setIsModalOpen(true)}>
          + Thêm Tài xế mới
        </button>
      </header>
      <CreateAccountModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={() => {
          setIsModalOpen(false);
          fetchDrivers();
          alert("Thêm tài xế thành công!");
        }}
        defaultRole="driver"
      />
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Tên Tài xế</th>
              <th style={styles.th}>Số điện thoại</th>
              <th style={styles.th}>Bằng lái</th>
              <th style={styles.th}>Trạng thái</th>
              <th style={styles.th}>Xe đang lái</th>
              <th style={styles.th}>Tác vụ</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map((driver) => (
              <tr key={driver.id} style={styles.tr}>
                <td style={styles.td}>{driver.fullName}</td>
                <td style={styles.td}>{driver.phone}</td>
                <td style={styles.td}>{driver.licenseNumber}</td>
                <td style={styles.td}>
                  <span style={styles.statusBadge(driver.status)}>
                    {driver.status}
                  </span>
                </td>
                {/* driver.CurrentBus là object được join từ Backend (driverService.js) */}
                <td style={styles.td}>
                  {driver.CurrentBus
                    ? driver.CurrentBus.license_plate
                    : "OFF_DUTY"}
                </td>
                <td style={styles.tdAction}>
                  <button style={styles.actionButton("edit")}>Sửa</button>
                  <button style={styles.actionButton("assign")}>Gán Xe</button>
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
// STYLES TỐI THIỂU (Tương tự các List Page khác)
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
    backgroundColor: type === "edit" ? "#007bff" : "#ffc107", // Gán Xe: Vàng, Sửa: Xanh dương
    color: type === "assign" ? "#333" : "white",
    fontSize: "12px",
  }),
  statusBadge: (status) => {
    let color = "#6c757d"; // Default (OFF_DUTY)
    if (status === "DRIVING") color = "#28a745";
    if (status === "AVAILABLE") color = "#007bff";

    return {
      padding: "4px 8px",
      borderRadius: "12px",
      backgroundColor: color,
      color: "white",
      fontSize: "12px",
      fontWeight: "bold",
      display: "inline-block",
      minWidth: "90px",
      textAlign: "center",
    };
  },
};

export default DriverListPage;
