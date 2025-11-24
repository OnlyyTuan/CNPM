// backend/src/routes/featureFlagRoutes.js
// Endpoint công khai để client lấy danh sách feature flags

const express = require('express');
const router = express.Router();
const config = require('../config/app.config');

// GET /api/v1/feature-flags
router.get('/', (req, res) => {
  try {
    const flags = config.FEATURE_FLAGS || {};
    res.status(200).json({
      success: true,
      flags,
    });
  } catch (err) {
    console.error('Lỗi trả về feature flags:', err);
    res.status(500).json({ success: false, message: 'Không lấy được feature flags' });
  }
});

module.exports = router;
