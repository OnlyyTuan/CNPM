// backend/src/controllers/driverController.js

// Cần cả hai Service
const userService = require("../services/userService");
const driverService = require("../services/driverService");
const db = require("../db");
const { Op } = require("sequelize");

const driverController = {
  // 1. Hàm tạo Tài xế & User (POST /api/v1/drivers)
  // **ĐÃ ĐƯỢC CẬP NHẬT** để gọi hàm Transaction mới
  async createDriver(req, res, next) {
    const { driverData, userData } = req.body;
    try {
      console.log("📝 Tạo tài xế mới:", { driverData, userData });

      // --- Pre-checks: kiểm tra trùng username / email / license_number để trả 400 rõ ràng ---
      if (userData && (userData.username || userData.email)) {
        if (userData.username) {
          const existUser = await db.User.findOne({
            where: { username: userData.username },
          });
          if (existUser) {
            return res.status(400).json({
              message: "Tên đăng nhập đã tồn tại. Vui lòng chọn tên khác.",
            });
          }
        }

        if (userData.email) {
          const existEmail = await db.User.findOne({
            where: { email: userData.email },
          });
          if (existEmail) {
            return res.status(400).json({
              message: "Email đã tồn tại. Vui lòng dùng email khác.",
            });
          }
        }
      }

      const licenseNum =
        driverData?.license_number || driverData?.licenseNumber;
      if (licenseNum) {
        const existDL = await db.Driver.findOne({
          where: { licenseNumber: licenseNum },
        });
        if (existDL) {
          return res.status(400).json({
            message: "Số GPLX đã tồn tại trong hệ thống.",
          });
        }
      }

      // GỌI HÀM TRANSACTION MỚI CỦA BẠN TỪ userService
      const result = await userService.createDriverAndUser(
        userData,
        driverData
      );

      console.log("✅ Tạo tài xế thành công:", result);

      res.status(201).json({
        message: "Tạo tài xế và tài khoản thành công!",
        driver: result.driver,
      });
    } catch (error) {
      console.error("❌ Lỗi khi tạo tài xế:", error);

      // Xử lý lỗi cụ thể
      let errorMessage = "Lỗi khi tạo tài xế.";

      if (error.name === "SequelizeUniqueConstraintError") {
        const field = error.errors[0]?.path;
        if (field === "username") {
          errorMessage =
            "Tên đăng nhập đã tồn tại. Vui lòng dùng số điện thoại khác.";
        } else if (field === "license_number") {
          errorMessage = "Số GPLX đã tồn tại trong hệ thống.";
        } else {
          errorMessage = `Trùng lặp dữ liệu: ${field}`;
        }
      }

      res.status(500).json({
        message: errorMessage,
        error: error.message,
        details: error.errors ? error.errors.map((e) => e.message) : [],
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
      res.status(500).json({
        message: "Lỗi khi lấy danh sách tài xế.",
        error: error.message,
      });
    }
  },

  // 4. Hàm cập nhật thông tin Tài xế (PUT /api/v1/drivers/:id)
  async updateDriver(req, res, next) {
    const { id } = req.params;
    const { driverData, userData } = req.body;

    try {
      // Lấy dữ liệu từ driverData nếu có, nếu không thì lấy từ body trực tiếp
      const updateData = driverData || req.body;

      console.log("📝 Cập nhật tài xế:", id, updateData);

      const updatedDriver = await driverService.updateDriver(id, updateData);

      // Nếu có userData, cập nhật thông tin user
      if (userData && updatedDriver) {
        const User = require("../models/User");
        await User.update(userData, {
          where: { id: updatedDriver.userId || updatedDriver.user_id },
        });
      }

      res.status(200).json({
        message: "Cập nhật tài xế thành công!",
        driver: updatedDriver,
      });
    } catch (error) {
      console.error("❌ Lỗi khi cập nhật tài xế:", error);
      res.status(500).json({
        message: "Lỗi khi cập nhật tài xế.",
        error: error.message,
      });
    }
  },

  // 5. Hàm lấy danh sách tài xế chưa có xe (GET /api/v1/drivers/available)
  async getAvailableDrivers(req, res, next) {
    try {
      const drivers = await driverService.getAvailableDrivers();
      res.status(200).json(drivers);
    } catch (error) {
      res.status(500).json({
        message: "Lỗi khi lấy danh sách tài xế khả dụng.",
        error: error.message,
      });
    }
  },

  // 5. Hàm xóa Tài xế (DELETE /api/v1/drivers/:id)
  async deleteDriver(req, res, next) {
    const { id } = req.params;
    try {
      await driverService.deleteDriver(id);
      res.status(200).json({
        message: "Xóa tài xế thành công!",
      });
    } catch (error) {
      res.status(500).json({
        message: "Lỗi khi xóa tài xế.",
        error: error.message,
      });
    }
  },
};

module.exports = driverController;
