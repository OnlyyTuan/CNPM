// backend/src/routes/scheduleRoutes.js
// Routes cho quản lý Lịch trình xe buýt

const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');

// Lấy thống kê lịch trình (phải đặt trước /:id để tránh conflict)
router.get('/statistics', scheduleController.getStatistics);

// Lấy lịch trình theo khoảng thời gian
router.get('/range', scheduleController.getSchedulesByDateRange);

// Lấy tất cả lịch trình
router.get('/', scheduleController.getAllSchedules);

// Lấy lịch trình theo ID
router.get('/:id', scheduleController.getScheduleById);

// Tạo lịch trình mới
router.post('/', scheduleController.createSchedule);

// Cập nhật lịch trình
router.put('/:id', scheduleController.updateSchedule);

// Xóa lịch trình
router.delete('/:id', scheduleController.deleteSchedule);

module.exports = router;
