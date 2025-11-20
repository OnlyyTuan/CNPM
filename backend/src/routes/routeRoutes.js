const express = require("express");
const router = express.Router();
const routeController = require("../controllers/routeController");
const locationController = require("../controllers/locationController");

// Đăng ký các route:
router.get('/', routeController.getAllRoutes);
router.get('/:id/waypoints', routeController.getRouteWaypoints); // API mới cho waypoints - PHẢI TRƯỚC /:id
router.get('/:id', routeController.getRouteById);
router.post('/', routeController.createRoute);
router.put('/:id', routeController.updateRoute);
router.delete('/:id', routeController.deleteRoute);

// Location endpoints
router.get('/locations', locationController.findAll);
router.post('/locations', locationController.create);
router.put('/locations/:id', locationController.update);
router.delete('/locations/:id', locationController.delete);

module.exports = router;