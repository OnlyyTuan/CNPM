// backend/src/routes/driverRoutes.js

const express = require("express");
const router = express.Router();
// ĐẢM BẢO DÒNG NÀY ĐÃ IMPORT CHÍNH XÁC:
const driverController = require("../controllers/driverController");
const { verifyToken } = require("../middleware/authMiddleware");

// Routes mới cho tài xế - chỉ xem xe và học sinh của mình
router.get("/my/buses", verifyToken, driverController.getMyBuses);
router.get("/my/students", verifyToken, driverController.getMyStudents);

// ... (Các route khác) ...

// Gán xe buýt
router.put("/:id/assign-bus", driverController.assignBus);

// Lấy danh sách
router.get("/", driverController.getAllDrivers);

// ...

module.exports = router;
