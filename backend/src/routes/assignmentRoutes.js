// backend/src/routes/assignmentRoutes.js
// Routes cho phân công tài xế và xe buýt

const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');

// Lấy danh sách có thể phân công
router.get('/available', assignmentController.getAvailableForAssignment);

// Lấy tất cả phân công hiện tại
router.get('/', assignmentController.getAllAssignments);

// Phân công tài xế cho xe buýt
router.post('/assign-driver-bus', assignmentController.assignDriverToBus);

// Phân công xe buýt cho tuyến đường
router.post('/assign-bus-route', assignmentController.assignBusToRoute);

// Hủy phân công tài xế
router.delete('/unassign-driver/:driver_id', assignmentController.unassignDriver);

module.exports = router;
