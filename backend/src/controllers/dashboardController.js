// backend/src/controllers/dashboardController.js
// Controller xử lý các request cho Dashboard Admin

const dashboardService = require('../services/dashboardService');

class DashboardController {
  /**
   * GET /api/dashboard - Lấy tất cả dữ liệu cho dashboard
   */
  async getDashboardData(req, res) {
    try {
      const data = await dashboardService.getDashboardData();
      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * GET /api/dashboard/overview - Lấy thống kê tổng quan
   */
  async getOverviewStats(req, res) {
    try {
      const stats = await dashboardService.getOverviewStats();
      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * GET /api/dashboard/bus-status - Lấy thống kê xe buýt theo trạng thái
   */
  async getBusStatusStats(req, res) {
    try {
      const stats = await dashboardService.getBusStatusStats();
      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * GET /api/dashboard/students-by-route - Lấy phân bố học sinh theo tuyến
   */
  async getStudentsByRoute(req, res) {
    try {
      const stats = await dashboardService.getStudentsByRoute();
      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * GET /api/dashboard/unassigned - Lấy danh sách xe và tài xế chưa phân công
   */
  async getUnassignedData(req, res) {
    try {
      const [buses, drivers] = await Promise.all([
        dashboardService.getUnassignedBuses(),
        dashboardService.getUnassignedDrivers(),
      ]);

      res.status(200).json({
        success: true,
        data: {
          buses,
          drivers,
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

module.exports = new DashboardController();
