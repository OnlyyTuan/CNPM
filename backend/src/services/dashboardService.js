// backend/src/services/dashboardService.js
// Service xử lý logic cho Dashboard Admin - thống kê tổng quan hệ thống

const db = require('../database');

class DashboardService {
  /**
   * Lấy tổng số lượng các đối tượng trong hệ thống
   */
  async getOverviewStats() {
    try {
      // Đếm tổng số học sinh
      const [studentCount] = await db.query('SELECT COUNT(*) as total FROM student');
      
      // Đếm tổng số tài xế
      const [driverCount] = await db.query('SELECT COUNT(*) as total FROM driver');
      
      // Đếm tổng số xe buýt
      const [busCount] = await db.query('SELECT COUNT(*) as total FROM bus');
      
      // Đếm tổng số tuyến đường
      const [routeCount] = await db.query('SELECT COUNT(*) as total FROM route');
      
      // Đếm xe buýt đang hoạt động
      const [activeBusCount] = await db.query(
        "SELECT COUNT(*) as total FROM bus WHERE status = 'ACTIVE'"
      );
      
      // Đếm lịch trình hôm nay
      const [todayScheduleCount] = await db.query(`
        SELECT COUNT(*) as total FROM schedule 
        WHERE DATE(start_time) = CURDATE()
      `);

      return {
        totalStudents: studentCount[0].total,
        totalDrivers: driverCount[0].total,
        totalBuses: busCount[0].total,
        totalRoutes: routeCount[0].total,
        activeBuses: activeBusCount[0].total,
        todaySchedules: todayScheduleCount[0].total,
      };
    } catch (error) {
      throw new Error(`Lỗi khi lấy thống kê tổng quan: ${error.message}`);
    }
  }

  /**
   * Lấy thống kê xe buýt theo trạng thái
   */
  async getBusStatusStats() {
    try {
      const [stats] = await db.query(`
        SELECT 
          status,
          COUNT(*) as count
        FROM bus
        GROUP BY status
      `);
      
      return stats;
    } catch (error) {
      throw new Error(`Lỗi khi lấy thống kê xe buýt: ${error.message}`);
    }
  }

  /**
   * Lấy phân bố học sinh theo tuyến đường
   */
  async getStudentsByRoute() {
    try {
      const [stats] = await db.query(`
        SELECT 
          r.route_name,
          COUNT(DISTINCT s.id) as student_count
        FROM route r
        LEFT JOIN bus b ON r.id = b.route_id
        LEFT JOIN student s ON b.id = s.assigned_bus_id
        GROUP BY r.id, r.route_name
        ORDER BY student_count DESC
      `);
      
      return stats;
    } catch (error) {
      throw new Error(`Lỗi khi lấy phân bố học sinh: ${error.message}`);
    }
  }

  /**
   * Lấy thống kê lịch trình theo trạng thái
   */
  async getScheduleStats() {
    try {
      const [stats] = await db.query(`
        SELECT 
          status,
          COUNT(*) as count
        FROM schedule
        GROUP BY status
      `);
      
      return stats;
    } catch (error) {
      throw new Error(`Lỗi khi lấy thống kê lịch trình: ${error.message}`);
    }
  }

  /**
   * Lấy danh sách lịch trình gần đây
   */
  async getRecentSchedules(limit = 5) {
    try {
      const [schedules] = await db.query(`
        SELECT 
          s.id,
          s.start_time,
          s.end_time,
          s.status,
          b.license_plate,
          r.route_name,
          d.full_name as driver_name
        FROM schedule s
        LEFT JOIN bus b ON s.bus_id = b.id
        LEFT JOIN route r ON s.route_id = r.id
        LEFT JOIN driver d ON b.driver_id = d.id
        ORDER BY s.start_time DESC
        LIMIT ?
      `, [limit]);
      
      return schedules;
    } catch (error) {
      throw new Error(`Lỗi khi lấy lịch trình gần đây: ${error.message}`);
    }
  }

  /**
   * Lấy thống kê tài xế theo trạng thái
   */
  async getDriverStatusStats() {
    try {
      const [stats] = await db.query(`
        SELECT 
          status,
          COUNT(*) as count
        FROM driver
        GROUP BY status
      `);
      
      return stats;
    } catch (error) {
      throw new Error(`Lỗi khi lấy thống kê tài xế: ${error.message}`);
    }
  }

  /**
   * Lấy xe buýt chưa được phân công tài xế
   */
  async getUnassignedBuses() {
    try {
      const [buses] = await db.query(`
        SELECT 
          b.id,
          b.license_plate,
          b.capacity,
          b.status
        FROM bus b
        WHERE b.driver_id IS NULL
        AND b.status = 'ACTIVE'
      `);
      
      return buses;
    } catch (error) {
      throw new Error(`Lỗi khi lấy xe buýt chưa phân công: ${error.message}`);
    }
  }

  /**
   * Lấy tài xế chưa được phân công xe
   */
  async getUnassignedDrivers() {
    try {
      const [drivers] = await db.query(`
        SELECT 
          d.id,
          d.full_name,
          d.phone,
          d.license_number,
          d.status
        FROM driver d
        WHERE d.current_bus_id IS NULL
        AND d.status != 'INACTIVE'
      `);
      
      return drivers;
    } catch (error) {
      throw new Error(`Lỗi khi lấy tài xế chưa phân công: ${error.message}`);
    }
  }

  /**
   * Lấy tất cả dữ liệu cho dashboard
   */
  async getDashboardData() {
    try {
      const [overview, busStatus, studentsByRoute, scheduleStats, recentSchedules, driverStatus] = 
        await Promise.all([
          this.getOverviewStats(),
          this.getBusStatusStats(),
          this.getStudentsByRoute(),
          this.getScheduleStats(),
          this.getRecentSchedules(),
          this.getDriverStatusStats(),
        ]);

      return {
        overview,
        busStatus,
        studentsByRoute,
        scheduleStats,
        recentSchedules,
        driverStatus,
      };
    } catch (error) {
      throw new Error(`Lỗi khi lấy dữ liệu dashboard: ${error.message}`);
    }
  }
}

module.exports = new DashboardService();
