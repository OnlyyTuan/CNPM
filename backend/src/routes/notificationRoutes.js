const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware.verifyToken);

router.get('/', notificationController.getMyNotifications);
router.post('/send-to-bus', authMiddleware.restrictTo('admin'), notificationController.sendToBus);

module.exports = router;
