// backend/src/routes/driverRoutes.js

const express = require("express");
const router = express.Router();
// ĐẢM BẢO DÒNG NÀY ĐÃ IMPORT CHÍNH XÁC:
const driverController = require("../controllers/driverController");
const { verifyToken } = require("../middleware/authMiddleware");

// Routes mới cho tài xế - chỉ xem xe và học sinh của mình
router.get("/my/buses", verifyToken, driverController.getMyBuses);
router.get("/my/students", verifyToken, driverController.getMyStudents);
// Tài xế cập nhật trạng thái học sinh (đã đón / đã tới)
router.put(
  "/my/students/:id/status",
  verifyToken,
  (req, res, next) => {
    console.log("[driverRoutes] PUT /my/students/:id/status - hit middleware");
    console.log("[driverRoutes] req.user:", req.user);
    next();
  },
  driverController.updateStudentStatus
);

// Lấy danh sách tài xế chưa có xe (phải đặt trước route /)
router.get("/available", driverController.getAvailableDrivers);

// Lấy danh sách tài xế
router.get("/", driverController.getAllDrivers);

// Thêm tài xế mới
router.post("/", driverController.createDriver);

// Cập nhật tài xế
router.put("/:id", driverController.updateDriver);

// Xóa tài xế
router.delete("/:id", driverController.deleteDriver);

// Gán xe buýt
router.put("/:id/assign-bus", driverController.assignBus);

module.exports = router;
