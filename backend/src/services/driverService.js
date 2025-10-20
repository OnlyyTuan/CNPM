// backend/src/services/driverService.js

const { sequelize, Driver, Bus } = require("../db");
// const userService = require('./userService'); // Giữ lại nếu cần User

const driverService = {
  // 1. Lấy danh sách Tài xế kèm thông tin Xe buýt (Dùng cho GET /api/v1/drivers)
  async getAllDriversWithBus() {
    return Driver.findAll({
      include: [
        {
          model: Bus,
          as: "CurrentBus", // BÍ DANH ĐÃ ĐÚNG
          attributes: ["id", "license_plate", "capacity", "status"], // Chọn các cột cần thiết
          required: false,
        },
      ],
      order: [["full_name", "ASC"]], // Sắp xếp theo tên
    });
  },

  // THÊM: Lấy chi tiết tài xế theo ID
  async getDriverById(id) {
    return Driver.findByPk(id, {
      include: [
        {
          model: Bus,
          as: "CurrentBus",
          attributes: ["id", "license_plate", "capacity", "status"],
          required: false,
        },
      ],
    });
  },

  // THÊM: Tạo tài xế mới (CRUD cơ bản)
  // Lưu ý: Tên cột phải khớp với Model: full_name, licenseNumber
  async createDriver(data) {
    return Driver.create(data);
  },

  // THÊM: Cập nhật thông tin tài xế (CRUD cơ bản)
  async updateDriver(id, data) {
    const [updated] = await Driver.update(data, {
      where: { id: id },
    });
    if (updated) {
      return this.getDriverById(id);
    }
    return null;
  },

  // THÊM: Xóa tài xế (CRUD cơ bản)
  async deleteDriver(id) {
    return Driver.destroy({
      where: { id: id },
    });
  },

  // Logic gán/hủy gán Xe buýt và Tài xế (Đã được bạn cung cấp, rất tốt!)
  async assignBusToDriver(driverId, busId) {
    const t = await sequelize.transaction();
    try {
      // ... (Phần logic Transaction của bạn) ...
      const driver = await Driver.findByPk(driverId, { transaction: t });
      const bus = busId ? await Bus.findByPk(busId, { transaction: t }) : null;

      if (!driver) {
        throw new Error("Driver not found.");
      }
      if (busId && !bus) {
        throw new Error("Bus not found.");
      }

      // 2. Hủy gán xe cũ của tài xế (nếu có)
      if (driver.currentBus_id && driver.currentBus_id !== busId) {
        await Bus.update(
          { driver_id: null },
          { where: { id: driver.currentBus_id }, transaction: t }
        );
      }

      // 3. Hủy gán tài xế cũ của xe buýt mục tiêu
      if (bus && bus.driver_id && bus.driver_id !== driverId) {
        await Driver.update(
          { currentBus_id: null, status: "OFF_DUTY" },
          { where: { id: bus.driver_id }, transaction: t }
        );
      }

      // 4. Gán Tài xế mới vào Xe buýt (hoặc hủy gán nếu busId là null)
      await Driver.update(
        {
          currentBus_id: busId,
          status: busId ? "DRIVING" : "OFF_DUTY",
        },
        { where: { id: driverId }, transaction: t }
      );

      // 5. Gán Xe buýt cho Tài xế mới
      if (bus) {
        await Bus.update(
          { driver_id: driverId },
          { where: { id: busId }, transaction: t }
        );
      }

      await t.commit();
      return {
        message: busId
          ? `Assigned Bus ${busId} to Driver ${driverId}`
          : `Unassigned Bus from Driver ${driverId}`,
      };
    } catch (error) {
      await t.rollback();
      throw error;
    }
  },
};

module.exports = driverService;
