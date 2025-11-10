// backend/src/routes/busRoutes.js
const express = require('express');
const router = express.Router();
const busController = require('../controllers/busController');

// Đăng ký các route:
router.get('/', busController.findAll);
router.get('/live-location', busController.getLiveLocations);
router.post('/', busController.create);
router.put('/:id', busController.update);
router.put('/:id/location', busController.updateLocation);
router.delete('/:id', busController.delete);

module.exports = router;