// backend/src/controllers/driverController.js

// Cần cả hai Service
const userService = require("../services/userService");
const driverService = require("../services/driverService");

const driverController = {
  // 1. Hàm tạo Tài xế & User (POST /api/v1/drivers)
  // **ĐÃ ĐƯỢC CẬP NHẬT** để gọi hàm Transaction mới
  async createDriver(req, res, next) {
    const { driverData, userData } = req.body;
    try {
      // GỌI HÀM TRANSACTION MỚI CỦA BẠN TỪ userService
      const result = await userService.createDriverAndUser(
        userData,
        driverData
      );

      res.status(201).json({
        message: "Tạo tài xế và tài khoản thành công!",
        driver: result.driver,
      });
    } catch (error) {
      // Lỗi có thể do unique constraint (username, licenseNumber)
      res.status(500).json({
        message: "Lỗi khi tạo tài xế. Kiểm tra tên đăng nhập/GPLX.",
        error: error.message,
      });
    }
  },

  // 2. Hàm Gán Xe buýt (PUT /api/v1/drivers/:id/assign-bus)
  // Hàm này được gọi trong driverRoutes.js, đảm bảo nó là một function hợp lệ
  async assignBus(req, res, next) {
    const { id } = req.params;
    const { busId } = req.body;
    try {
      // Gọi hàm nghiệp vụ Gán 1-1
      await driverService.assignBusToDriver(id, busId || null);
      res.status(200).json({
        message: busId
          ? `Gán xe ${busId} cho tài xế ${id} thành công.`
          : `Hủy gán xe thành công.`,
      });
    } catch (error) {
      res.status(400).json({ message: "Lỗi gán xe:", error: error.message });
    }
  },

  // 3. Hàm lấy danh sách Tài xế (GET /api/v1/drivers)
  // Hàm này cũng phải tồn tại và là function hợp lệ
  async getAllDrivers(req, res, next) {
    try {
      const drivers = await driverService.getAllDriversWithBus();
      res.status(200).json(drivers);
    } catch (error) {
      res
        .status(500)
        .json({
          message: "Lỗi khi lấy danh sách tài xế.",
          error: error.message,
        });
    }
  },
};

module.exports = driverController;
