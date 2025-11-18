// backend/src/routes/dashboardRoutes.js
// Routes cho Dashboard Admin

const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// Lấy tất cả dữ liệu dashboard
router.get('/', dashboardController.getDashboardData);

// Lấy thống kê tổng quan
router.get('/overview', dashboardController.getOverviewStats);

// Lấy thống kê xe buýt theo trạng thái
router.get('/bus-status', dashboardController.getBusStatusStats);

// Lấy phân bố học sinh theo tuyến
router.get('/students-by-route', dashboardController.getStudentsByRoute);

// Lấy danh sách xe và tài xế chưa phân công
router.get('/unassigned', dashboardController.getUnassignedData);

module.exports = router;
