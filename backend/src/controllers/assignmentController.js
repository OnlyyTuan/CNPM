// backend/src/controllers/assignmentController.js
// Controller xử lý phân công tài xế và xe buýt cho tuyến đường

const db = require("../database");

class AssignmentController {
  /**
   * POST /api/assignments/assign-driver-bus - Phân công tài xế cho xe buýt
   */
  async assignDriverToBus(req, res) {
    try {
      const { driver_id, bus_id } = req.body;

      if (!driver_id || !bus_id) {
        return res.status(400).json({
          success: false,
          message: "Thiếu thông tin driver_id hoặc bus_id",
        });
      }

      // Kiểm tra tài xế có tồn tại không
      const [drivers] = await db.query("SELECT * FROM driver WHERE id = ?", [
        driver_id,
      ]);
      if (drivers.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Tài xế không tồn tại",
        });
      }

      // Kiểm tra xe buýt có tồn tại không
      const [buses] = await db.query("SELECT * FROM bus WHERE id = ?", [
        bus_id,
      ]);
      if (buses.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Xe buýt không tồn tại",
        });
      }

      // Kiểm tra tài xế đã được phân công xe khác chưa
      if (drivers[0].current_bus_id && drivers[0].current_bus_id !== bus_id) {
        return res.status(400).json({
          success: false,
          message: "Tài xế đã được phân công cho xe buýt khác",
        });
      }

      // Kiểm tra xe buýt đã có tài xế khác chưa
      if (buses[0].driver_id && buses[0].driver_id !== driver_id) {
        return res.status(400).json({
          success: false,
          message: "Xe buýt đã có tài xế khác",
        });
      }

      // Cập nhật phân công
      await db.query(
        "UPDATE driver SET current_bus_id = ?, status = ? WHERE id = ?",
        [bus_id, "DRIVING", driver_id]
      );
      await db.query("UPDATE bus SET driver_id = ? WHERE id = ?", [
        driver_id,
        bus_id,
      ]);

      res.status(200).json({
        success: true,
        message: "Phân công tài xế cho xe buýt thành công",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * DELETE /api/assignments/unassign-driver/:driver_id - Hủy phân công tài xế
   */
  async unassignDriver(req, res) {
    try {
      const { driver_id } = req.params;

      // Lấy thông tin tài xế
      const [drivers] = await db.query(
        "SELECT current_bus_id FROM driver WHERE id = ?",
        [driver_id]
      );
      if (drivers.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Tài xế không tồn tại",
        });
      }

      const current_bus_id = drivers[0].current_bus_id;

      // Cập nhật driver
      await db.query(
        "UPDATE driver SET current_bus_id = NULL, status = ? WHERE id = ?",
        ["OFF_DUTY", driver_id]
      );

      // Cập nhật bus nếu có
      if (current_bus_id) {
        await db.query("UPDATE bus SET driver_id = NULL WHERE id = ?", [
          current_bus_id,
        ]);
      }

      res.status(200).json({
        success: true,
        message: "Hủy phân công tài xế thành công",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * POST /api/assignments/assign-bus-route - Phân công xe buýt cho tuyến đường
   */
  async assignBusToRoute(req, res) {
    try {
      const { bus_id, route_id } = req.body;

      // Clean incoming IDs: allow variants like '1-morning' -> 1
      const cleanBusId = (() => {
        const parsed = parseInt(String(bus_id), 10);
        return Number.isNaN(parsed) ? bus_id : parsed;
      })();

      const cleanRouteId = (() => {
        const parsed = parseInt(String(route_id), 10);
        return Number.isNaN(parsed) ? route_id : parsed;
      })();

      if (!bus_id || !route_id) {
        return res.status(400).json({
          success: false,
          message: "Thiếu thông tin bus_id hoặc route_id",
        });
      }

      // Kiểm tra xe buýt có tồn tại không
      // Use cleaned IDs for DB queries
      console.log(
        `[assignBusToRoute] bus_id received=${bus_id}, cleaned=${cleanBusId}, route_id received=${route_id}, cleaned=${cleanRouteId}`
      );
      const [buses] = await db.query("SELECT * FROM bus WHERE id = ?", [
        cleanBusId,
      ]);
      if (buses.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Xe buýt không tồn tại",
        });
      }

      // Kiểm tra tuyến đường có tồn tại không
      const [routes] = await db.query("SELECT * FROM route WHERE id = ?", [
        cleanRouteId,
      ]);
      if (routes.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Tuyến đường không tồn tại",
        });
      }

      // Lấy điểm đầu tiên của tuyến đường từ route_waypoint
      const [waypoints] = await db.query(
        "SELECT latitude, longitude FROM route_waypoint WHERE route_id = ? ORDER BY sequence ASC LIMIT 1",
        [cleanRouteId]
      );

      console.log(`[assignBusToRoute] Found ${waypoints.length} waypoints for route ${cleanRouteId}`);

      let currentLocationId = buses[0].current_location_id;

      // Nếu tìm thấy waypoint đầu tiên, cập nhật vị trí xe
      if (waypoints.length > 0) {
        const firstWaypoint = waypoints[0];
        console.log(`[assignBusToRoute] First waypoint: lat=${firstWaypoint.latitude}, lng=${firstWaypoint.longitude}`);
        
        // Tạo hoặc cập nhật current_location cho bus
        currentLocationId = `CUR_${cleanBusId}`;
        
        console.log(`[assignBusToRoute] Setting current_location_id to ${currentLocationId} at (${firstWaypoint.latitude}, ${firstWaypoint.longitude})`);
        
        // Kiểm tra xem location đã tồn tại chưa
        const [existingLoc] = await db.query(
          "SELECT id FROM location WHERE id = ?",
          [currentLocationId]
        );

        if (existingLoc.length === 0) {
          // Tạo mới location
          console.log(`[assignBusToRoute] Creating new location ${currentLocationId}`);
          await db.query(
            "INSERT INTO location (id, name, latitude, longitude, type) VALUES (?, ?, ?, ?, ?)",
            [
              currentLocationId,
              `Current location of ${cleanBusId}`,
              firstWaypoint.latitude,
              firstWaypoint.longitude,
              "bus_current"
            ]
          );
        } else {
          // Cập nhật location hiện có
          console.log(`[assignBusToRoute] Updating existing location ${currentLocationId}`);
          await db.query(
            "UPDATE location SET latitude = ?, longitude = ? WHERE id = ?",
            [firstWaypoint.latitude, firstWaypoint.longitude, currentLocationId]
          );
        }
      } else {
        console.warn(`[assignBusToRoute] No waypoints found for route ${cleanRouteId}, bus will have no location`);
      }

      // Cập nhật phân công xe với route và current_location
      await db.query(
        "UPDATE bus SET route_id = ?, current_location_id = ?, speed = 0 WHERE id = ?",
        [cleanRouteId, currentLocationId, cleanBusId]
      );

      res.status(200).json({
        success: true,
        message: "Phân công xe buýt cho tuyến đường thành công",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * GET /api/assignments - Lấy danh sách phân công hiện tại
   */
  async getAllAssignments(req, res) {
    try {
      const [assignments] = await db.query(`
        SELECT 
          b.id as bus_id,
          b.license_plate,
          b.capacity,
          b.status as bus_status,
          d.id as driver_id,
          d.full_name as driver_name,
          d.phone as driver_phone,
          d.license_number,
          d.status as driver_status,
          r.id as route_id,
          r.route_name,
          r.distance,
          r.estimated_duration
        FROM bus b
        LEFT JOIN driver d ON b.driver_id = d.id
        LEFT JOIN route r ON b.route_id = r.id
        ORDER BY b.license_plate
      `);

      res.status(200).json({
        success: true,
        data: assignments,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * GET /api/assignments/available - Lấy danh sách xe và tài xế có thể phân công
   */
  async getAvailableForAssignment(req, res) {
    try {
      // Lấy tài xế chưa có xe
      const [availableDrivers] = await db.query(`
        SELECT 
          id,
          full_name,
          phone,
          license_number,
          status
        FROM driver
        WHERE current_bus_id IS NULL
        AND status != 'INACTIVE'
        ORDER BY full_name
      `);

      // Lấy xe chưa có tài xế
      const [availableBuses] = await db.query(`
        SELECT 
          id,
          license_plate,
          capacity,
          status,
          route_id
        FROM bus
        WHERE driver_id IS NULL
        AND status = 'ACTIVE'
        ORDER BY license_plate
      `);

      // Lấy tất cả tuyến đường
      const [routes] = await db.query(`
        SELECT 
          id,
          route_name,
          distance,
          estimated_duration
        FROM route
        ORDER BY route_name
      `);

      res.status(200).json({
        success: true,
        data: {
          availableDrivers,
          availableBuses,
          routes,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new AssignmentController();
