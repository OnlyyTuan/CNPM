const express = require("express");
const router = express.Router();
const routeController = require("../controllers/routeController");

// Đăng ký các route:
router.get('/', routeController.getAllRoutes);
router.get('/:id/waypoints', routeController.getRouteWaypoints); // API mới cho waypoints - PHẢI TRƯỚC /:id
router.get('/:id', routeController.getRouteById);
router.post('/', routeController.createRoute);
router.put('/:id', routeController.updateRoute);
router.delete('/:id', routeController.deleteRoute);

module.exports = router;