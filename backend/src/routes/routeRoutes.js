const express = require("express");
const router = express.Router();
const routeController = require("../controllers/routeController");
const locationController = require("../controllers/locationController");

console.log('🟢 routeRoutes.js loaded');
console.log('locationController:', locationController);

// Locations endpoints
router.get('/locations', (req, res, next) => {
  console.log('🔵 Route /locations được gọi!');
  locationController.findAll(req, res, next);
});
router.post('/locations', locationController.create);
router.put('/locations/:id', locationController.update);
router.delete('/locations/:id', locationController.delete);

// Routes endpoints
router.get('/', routeController.getAllRoutes);
router.get('/:id/waypoints', routeController.getRouteWaypoints); // API mới cho waypoints - PHẢI TRƯỚC /:id
router.get('/:id', routeController.getRouteById);
router.post('/', routeController.createRoute);
router.put('/:id', routeController.updateRoute);
router.delete('/:id', routeController.deleteRoute);

module.exports = router;