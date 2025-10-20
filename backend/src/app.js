// backend/src/app.js (Tệp này dùng để cấu hình Express và định nghĩa các Routes)

const express = require("express");
const cors = require("cors");
const helmet = require("helmet"); // Thêm bảo mật cơ bản
const app = express();

// Import Routes đã tạo
const driverRoutes = require("./routes/driverRoutes");
const busRoutes = require("./routes/busRoutes");
const studentRoutes = require("./routes/studentRoutes");
const parentRoutes = require("./routes/parentRoutes");
// MIDDLEWARE
app.use(helmet());
app.use(cors());
app.use(express.json()); // Cho phép phân tích cú pháp JSON
app.use(express.urlencoded({ extended: true }));

// ĐỊNH NGHĨA CÁC API ENDPOINT (Sử dụng /api/v1 prefix)

// Gán prefix /api/v1/drivers cho các route quản lý tài xế
app.use("/api/v1/drivers", driverRoutes);
app.use("/api/v1/buses", busRoutes);
app.use("/api/v1/students", studentRoutes);
app.use("/api/v1/parents", parentRoutes);

// Health Check Route
app.get("/api/v1/health", (req, res) => {
  res
    .status(200)
    .send({ status: "OK", service: "SmartSchoolBus Backend v1.0" });
});

// Route trang chủ
app.get("/", (req, res) => {
  res.send(
    "<h1>Server Smart School Bus đang chạy!</h1><p>Sử dụng các endpoint API với prefix /api/v1/...</p>"
  );
});

// Xử lý Route không tồn tại (404)
app.use((req, res, next) => {
  res.status(404).send({ message: "Endpoint không tìm thấy." });
});

// Xử lý lỗi tập trung (Error Handler)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ message: "Lỗi server nội bộ!", error: err.message });
});

module.exports = app;
