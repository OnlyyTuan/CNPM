// backend/src/routes/studentRoutes.js

const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');

// Lấy danh sách học sinh
router.get('/', studentController.findAll);

// Lấy stops trên tuyến của xe bus (PHẢI TRƯỚC /:id)
// DISABLED - validation được thực hiện ở frontend qua route waypoints
// router.get('/bus/:busId/stops', studentController.getStopsForBus);

// Thêm học sinh mới
router.post('/', studentController.create);

// Cập nhật thông tin học sinh
router.put('/:id', studentController.update);

// Xóa học sinh
router.delete('/:id', studentController.delete);

// router.get('/:id', studentController.findOne); // Lấy chi tiết

router.get('/by-bus/:busId', studentController.getByBusId);
module.exports = router;