// backend/src/routes/driverRoutes.js

const express = require("express");
const router = express.Router();
// ĐẢM BẢO DÒNG NÀY ĐÃ IMPORT CHÍNH XÁC:
const driverController = require("../controllers/driverController");

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
