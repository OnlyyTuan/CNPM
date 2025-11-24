// backend/src/controllers/scheduleController.js
// Controller xử lý các request liên quan đến Lịch trình

const scheduleService = require("../services/scheduleService");

class ScheduleController {
  /**
   * GET /api/schedules - Lấy tất cả lịch trình
   */
  async getAllSchedules(req, res) {
    try {
      const schedules = await scheduleService.getAllSchedules();
      res.status(200).json({
        success: true,
        data: schedules,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * GET /api/schedules/:id - Lấy lịch trình theo ID
   */
  async getScheduleById(req, res) {
    try {
      const { id } = req.params;
      const schedule = await scheduleService.getScheduleById(id);

      if (!schedule) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy lịch trình",
        });
      }

      res.status(200).json({
        success: true,
        data: schedule,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * GET /api/schedules/range - Lấy lịch trình theo khoảng thời gian
   * Query params: startDate, endDate
   */
  async getSchedulesByDateRange(req, res) {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: "Vui lòng cung cấp startDate và endDate",
        });
      }

      const schedules = await scheduleService.getSchedulesByDateRange(
        startDate,
        endDate
      );
      res.status(200).json({
        success: true,
        data: schedules,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * GET /api/schedules/my - Lấy lịch trình cho tài xế đang đăng nhập
   * Query params optional: startDate, endDate
   */
  async getMySchedules(req, res) {
    try {
      // Debug: log that endpoint was called and req.user
      try {
        console.debug(
          "[scheduleController] getMySchedules called, headers.auth=",
          req.headers && req.headers.authorization
        );
        console.debug("[scheduleController] req.user =", req.user);
      } catch (e) {}
      // req.user được set bởi auth middleware
      // Support both: if middleware attached driverId (Dxxx), use it; otherwise fall back to user id
      const driverId = (req.user && (req.user.driverId || req.user.id)) || null;
      if (!driverId) {
        return res
          .status(401)
          .json({ success: false, message: "Không được ủy quyền" });
      }

      const { startDate, endDate } = req.query;
      const schedules = await scheduleService.getSchedulesForDriver(
        driverId,
        startDate,
        endDate
      );
      try {
        console.debug(
          "[scheduleController] schedules.length =",
          Array.isArray(schedules) ? schedules.length : "n/a"
        );
      } catch (e) {}
      res.status(200).json({ success: true, data: schedules });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * POST /api/schedules - Tạo lịch trình mới
   */
  async createSchedule(req, res) {
    try {
      const scheduleData = req.body;

      // Validate dữ liệu đầu vào
      if (
        !scheduleData.bus_id ||
        !scheduleData.route_id ||
        !scheduleData.start_time ||
        !scheduleData.end_time
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Thiếu thông tin bắt buộc: bus_id, route_id, start_time, end_time",
        });
      }

      const schedule = await scheduleService.createSchedule(scheduleData);
      res.status(201).json({
        success: true,
        message: "Tạo lịch trình thành công",
        data: schedule,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * PUT /api/schedules/:id - Cập nhật lịch trình
   */
  async updateSchedule(req, res) {
    try {
      const { id } = req.params;
      const scheduleData = req.body;

      const schedule = await scheduleService.updateSchedule(id, scheduleData);
      res.status(200).json({
        success: true,
        message: "Cập nhật lịch trình thành công",
        data: schedule,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * DELETE /api/schedules/:id - Xóa lịch trình
   */
  async deleteSchedule(req, res) {
    try {
      const { id } = req.params;
      const result = await scheduleService.deleteSchedule(id);
      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * GET /api/schedules/statistics - Lấy thống kê lịch trình
   */
  async getStatistics(req, res) {
    try {
      const stats = await scheduleService.getScheduleStatistics();
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
}

module.exports = new ScheduleController();
