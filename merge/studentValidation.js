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
    const [buses] = await db.query("SELECT route_id FROM bus WHERE id = ?", [
      busId,
    ]);

    if (buses.length === 0 || !buses[0].route_id) {
      return [];
    }

    const routeId = buses[0].route_id;

    // Lấy stops từ route_waypoint và map với location
    // Thử truy vấn ghép chính xác trước
    const [stops] = await db.query(
      `SELECT DISTINCT l.id, l.name, l.address, rw.latitude, rw.longitude, rw.stop_name, rw.sequence
       FROM route_waypoint rw
       JOIN location l ON rw.latitude = l.latitude AND rw.longitude = l.longitude
       WHERE rw.route_id = ? 
       AND rw.is_stop = 1
       ORDER BY rw.sequence`,
      [routeId]
    );

    if (stops && stops.length > 0) return stops;

    // Fallback: nếu không tìm thấy kết quả (do precision mismatch hoặc chưa có route_waypoint data),
    // thử so khớp gần đúng dựa trên ABS diff giữa tọa độ
    const epsilon = 0.0001;
    const [approxStops] = await db.query(
      `SELECT DISTINCT l.id, l.name, l.address, rw.latitude, rw.longitude, rw.stop_name, rw.sequence
       FROM route_waypoint rw
       JOIN location l ON ABS(CAST(rw.latitude AS DECIMAL(12,6)) - CAST(l.latitude AS DECIMAL(12,6))) < ?
         AND ABS(CAST(rw.longitude AS DECIMAL(12,6)) - CAST(l.longitude AS DECIMAL(12,6))) < ?
       WHERE rw.route_id = ?
       AND rw.is_stop = 1
       ORDER BY rw.sequence`,
      [epsilon, epsilon, routeId]
    );

    if (approxStops && approxStops.length > 0) return approxStops;

    // Nếu vẫn rỗng (không có route_waypoint), fallback trả về toàn bộ locations
    // để frontend có thể hiển thị các điểm khả dụng.
    const [allLocs] = await db.query(
      `SELECT id, name, address, latitude, longitude, type FROM location`
    );
    return allLocs || [];
  } catch (error) {
    console.error("Error getting stops on route:", error);
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

  // If the route has no waypoints defined, skip strict validation to avoid
  // rejecting valid existing data when route_waypoint is empty in DB.
  try {
    const [b] = await db.query("SELECT route_id FROM bus WHERE id = ?", [
      busId,
    ]);
    if (b && b.length > 0 && b[0].route_id) {
      const routeId = b[0].route_id;
      const [cnt] = await db.query(
        "SELECT COUNT(*) as c FROM route_waypoint WHERE route_id = ?",
        [routeId]
      );
      if (cnt && cnt[0] && cnt[0].c === 0) {
        return { valid: true, errors: [] };
      }
    }
  } catch (e) {
    // ignore and continue validation normally
  }

  // Kiểm tra pickup location
  if (pickupLocationId) {
    const isValid = await isLocationOnBusRoute(busId, pickupLocationId);
    if (!isValid) {
      errors.push(
        "Điểm đón phải là một điểm dừng trên tuyến của xe bus được phân công"
      );
    }
  }

  // Kiểm tra dropoff location
  if (dropoffLocationId) {
    const isValid = await isLocationOnBusRoute(busId, dropoffLocationId);
    if (!isValid) {
      errors.push(
        "Điểm trả phải là một điểm dừng trên tuyến của xe bus được phân công"
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

module.exports = {
  isLocationOnBusRoute,
  getStopsOnBusRoute,
  validateStudentLocations,
};
