// backend/src/routes/driverRoutes.js

const express = require("express");
const router = express.Router();
// ĐẢM BẢO DÒNG NÀY ĐÃ IMPORT CHÍNH XÁC:
const driverController = require("../controllers/driverController");

// ... (Các route khác) ...

// Gán xe buýt
router.put("/:id/assign-bus", driverController.assignBus);

// Lấy danh sách
router.get("/", driverController.getAllDrivers);

// ...

module.exports = router;
