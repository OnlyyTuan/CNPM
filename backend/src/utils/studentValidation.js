// backend/src/utils/studentValidation.js
// Validation utilities cho student pickup/dropoff locations

const db = require('../database');

/**
 * Kiểm tra xem location có phải là stop trên tuyến của bus không
 * @param {string} busId - ID của xe bus
 * @param {string} locationId - ID của location cần kiểm tra
 * @returns {Promise<boolean>} - true nếu location là stop trên tuyến
 */
async function isLocationOnBusRoute(busId, locationId) {
  try {
    // 1. Lấy route_id của bus
    const [buses] = await db.query(
      'SELECT route_id FROM bus WHERE id = ?',
      [busId]
    );

    if (buses.length === 0 || !buses[0].route_id) {
      return false; // Bus không tồn tại hoặc chưa có tuyến
    }

    const routeId = buses[0].route_id;

    // 2. Kiểm tra location có trong route_waypoint và là stop không
    const [waypoints] = await db.query(
      `SELECT COUNT(*) as count 
       FROM route_waypoint rw
       JOIN location l ON rw.latitude = l.latitude AND rw.longitude = l.longitude
       WHERE rw.route_id = ? 
       AND l.id = ? 
       AND rw.is_stop = 1`,
      [routeId, locationId]
    );

    return waypoints[0].count > 0;
  } catch (error) {
    console.error('Error validating location on route:', error);
    return false;
  }
}

/**
 * Lấy danh sách stops trên tuyến của bus
 * @param {string} busId - ID của xe bus
 * @returns {Promise<Array>} - Danh sách locations là stops
 */
async function getStopsOnBusRoute(busId) {
  try {
    console.log('[DEBUG] getStopsOnBusRoute called with busId:', busId);
    
    // Trả về TẤT CẢ locations để người dùng chọn
    // Backend sẽ validate xem location có nằm trên route hay không khi submit
    const [locations] = await db.query(
      `SELECT id, name, address, latitude, longitude 
       FROM location 
       ORDER BY name`
    );

    console.log('[DEBUG] Found', locations.length, 'locations');
    
    return locations;
  } catch (error) {
    console.error('Error getting locations:', error);
    return [];
  }
}

/**
 * Validate student pickup/dropoff locations
 * @param {string} busId - ID của xe bus
 * @param {string} pickupLocationId - ID điểm đón
 * @param {string} dropoffLocationId - ID điểm trả
 * @returns {Promise<{valid: boolean, errors: Array}>}
 */
async function validateStudentLocations(busId, pickupLocationId, dropoffLocationId) {
  const errors = [];

  if (!busId) {
    errors.push('Học sinh phải được phân công xe bus');
    return { valid: false, errors };
  }

  // Kiểm tra pickup location
  if (pickupLocationId) {
    const isValid = await isLocationOnBusRoute(busId, pickupLocationId);
    if (!isValid) {
      errors.push('Điểm đón phải là một điểm dừng trên tuyến của xe bus được phân công');
    }
  }

  // Kiểm tra dropoff location
  if (dropoffLocationId) {
    const isValid = await isLocationOnBusRoute(busId, dropoffLocationId);
    if (!isValid) {
      errors.push('Điểm trả phải là một điểm dừng trên tuyến của xe bus được phân công');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

module.exports = {
  isLocationOnBusRoute,
  getStopsOnBusRoute,
  validateStudentLocations
};
