// backend/src/routes/parentRoutes.js

const express = require('express');
const router = express.Router();
const parentController = require('../controllers/parentController');

// [GET] /api/v1/parents - Lấy danh sách Phụ huynh (kèm Học sinh)
router.get('/', parentController.findAllParents);

// [POST] /api/v1/parents - Tạo Phụ huynh & Học sinh (Transaction)
router.post('/', parentController.createParentAndStudent);

// [GET] /api/v1/parents/students/:id - Lấy chi tiết Học sinh (kèm Bus, Location, Parent)
router.get('/students/:id', parentController.findStudentDetail);

module.exports = router;