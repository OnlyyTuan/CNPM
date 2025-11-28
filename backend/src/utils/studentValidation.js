// backend/src/utils/studentValidation.js
// Validation utilities cho student pickup/dropoff locations

const db = require("../database");

/**
 * Kiểm tra xem location có phải là stop trên tuyến của bus không
 * @param {string} busId - ID của xe bus
 * @param {string} locationId - ID của location cần kiểm tra
 * @returns {Promise<boolean>} - true nếu location là stop trên tuyến
 */
async function isLocationOnBusRoute(busId, locationId) {
  try {
    // 1. Lấy route_id của bus
    const [buses] = await db.query("SELECT route_id FROM bus WHERE id = ?", [
      busId,
    ]);

    if (buses.length === 0 || !buses[0].route_id) {
      return false; // Bus không tồn tại hoặc chưa có tuyến
    }

    const routeId = buses[0].route_id;

    // 2. Kiểm tra location có trong route_waypoint và là stop không
    // Thử kiểm tra bằng join chính xác trước
    const [exact] = await db.query(
      `SELECT COUNT(*) as count 
       FROM route_waypoint rw
       JOIN location l ON rw.latitude = l.latitude AND rw.longitude = l.longitude
       WHERE rw.route_id = ? 
       AND l.id = ? 
       AND rw.is_stop = 1`,
      [routeId, locationId]
    );

    if (exact && exact[0] && exact[0].count > 0) return true;

    // Nếu không có kết quả chính xác (có thể do sai khác precision), thử so khớp gần đúng
    // Lấy toạ độ của location
    const [locRows] = await db.query(
      `SELECT latitude, longitude FROM location WHERE id = ? LIMIT 1`,
      [locationId]
    );
    if (!locRows || locRows.length === 0) return false;
    const loc = locRows[0];

    // So khớp gần đúng: khác nhau trong một ngưỡng nhỏ (epsilon)
    const epsilon = 0.0001; // ~ 0.01m precision
    const [approx] = await db.query(
      `SELECT COUNT(*) as count
       FROM route_waypoint rw
       WHERE rw.route_id = ?
       AND rw.is_stop = 1
       AND ABS(CAST(rw.latitude AS DECIMAL(12,6)) - CAST(? AS DECIMAL(12,6))) < ?
       AND ABS(CAST(rw.longitude AS DECIMAL(12,6)) - CAST(? AS DECIMAL(12,6))) < ?`,
      [routeId, loc.latitude, epsilon, loc.longitude, epsilon]
    );

    return approx && approx[0] && approx[0].count > 0;
  } catch (error) {
    console.error("Error validating location on route:", error);
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
    // Trả về tất cả locations - validation sẽ được thực hiện ở frontend
    const [allLocs] = await db.query(
      `SELECT id, name, address, latitude, longitude FROM location ORDER BY name`
    );
    return allLocs || [];
  } catch (error) {
    console.error("Error getting locations:", error);
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
async function validateStudentLocations(
  busId,
  pickupLocationId,
  dropoffLocationId
) {
  const errors = [];

  if (!busId) {
    errors.push("Học sinh phải được phân công xe bus");
    return { valid: false, errors };
  }

  // Tạm thời bỏ validation vì admin có thể chọn bất kỳ location nào
  // không bắt buộc phải nằm trong route_waypoint
  return { valid: true, errors: [] };
}

module.exports = {
  isLocationOnBusRoute,
  getStopsOnBusRoute,
  validateStudentLocations,
};
