const { sequelize, Driver, Bus } = require("../db");

const driverService = {
  // 1. Lấy danh sách Tài xế kèm thông tin Xe buýt
  async getAllDriversWithBus() {
    return Driver.findAll({
      attributes: [
        "id",
        "fullName",
        "phone",
        "licenseNumber",
        "status",
        "currentBusId",
        "userId",
      ],
      include: [
        {
          model: Bus,
          as: "CurrentBus",
          attributes: ["id", "licensePlate", "capacity", "status"],
          required: false,
        },
      ],
      order: [["fullName", "ASC"]], // Sắp xếp theo tên thuộc tính JS
    });
  },

  // 2. Lấy chi tiết tài xế theo ID
  async getDriverById(id) {
    return Driver.findByPk(id, {
      attributes: [
        "id",
        "fullName",
        "phone",
        "licenseNumber",
        "status",
        "currentBusId",
        "userId",
      ],
      include: [
        {
          model: Bus,
          as: "CurrentBus",
          attributes: ["id", "licensePlate", "capacity", "status"],
          required: false,
        },
      ],
    });
  },

  // 3. Tạo tài xế mới
  async createDriver(data) {
    return Driver.create(data);
  },

  // 4. Cập nhật thông tin tài xế
  async updateDriver(id, data) {
    const [updated] = await Driver.update(data, {
      where: { id: id },
    });
    if (updated) {
      return this.getDriverById(id);
    }
    return null;
  },

  // 5. Xóa tài xế
  async deleteDriver(id) {
    return Driver.destroy({
      where: { id: id },
    });
  },

  // 6. Logic gán/hủy gán Xe buýt và Tài xế (Transaction)
  async assignBusToDriver(driverId, busId) {
    const t = await sequelize.transaction();
    try {
      const driver = await Driver.findByPk(driverId, { transaction: t });
      const bus = busId ? await Bus.findByPk(busId, { transaction: t }) : null;

      if (!driver) {
        throw new Error("Driver not found.");
      }
      if (busId && !bus) {
        throw new Error("Bus not found.");
      }

      const currentBusOfDriver = driver.currentBusId;

      // Hủy gán xe cũ của tài xế (nếu có)
      if (currentBusOfDriver && currentBusOfDriver !== busId) {
        await Bus.update(
          { driverId: null },
          { where: { id: currentBusOfDriver }, transaction: t }
        );
      }

      // Hủy gán tài xế cũ của xe buýt mục tiêu
      if (bus && bus.driverId && bus.driverId !== driverId) {
        await Driver.update(
          { currentBusId: null, status: "OFF_DUTY" },
          { where: { id: bus.driverId }, transaction: t }
        );
      }

      // Gán Tài xế mới vào Xe buýt (hoặc hủy gán nếu busId là null)
      await Driver.update(
        {
          currentBusId: busId,
          status: busId ? "DRIVING" : "OFF_DUTY",
        },
        { where: { id: driverId }, transaction: t }
      );

      // Gán Xe buýt cho Tài xế mới
      if (bus) {
        await Bus.update(
          { driverId: driverId },
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
