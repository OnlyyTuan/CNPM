const { sequelize, Driver, Bus, User } = require("../db");

const driverService = {
  // 1. Lấy danh sách Tài xế kèm thông tin Xe buýt
  async getAllDriversWithBus() {
    return Driver.findAll({
      attributes: [
        "id",
        "full_name",
        "phone",
        "license_number",
        "status",
        ["current_bus_id", "currentBusId"],
        ["user_id", "userId"],
      ],
      include: [
        {
          model: Bus,
          as: "CurrentBus",
          attributes: ["id", "license_plate", "capacity", "status"],
          required: false,
        },
        {
          model: User,
          as: "UserAccount",
          attributes: ["username"],
          required: false,
        },
      ],
      order: [["full_name", "ASC"]],
    });
  },

  // 2. Lấy chi tiết tài xế theo ID
  async getDriverById(id) {
    return Driver.findByPk(id, {
      include: [
        {
          model: Bus,
          as: "CurrentBus",
          attributes: ["id", "license_plate", "capacity", "status"],
          required: false,
        },
        {
          model: User,
          as: "UserAccount",
          attributes: ["username"],
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
    const [updated] = await Driver.update(data, { where: { id } });
    if (updated) return this.getDriverById(id);
    return null;
  },

  // 5. Xóa tài xế
  async deleteDriver(id) {
    await Driver.destroy({ where: { id } });
    return true;
  },

  // 6. Gán hoặc hủy gán tài xế cho xe buýt
  async assignBusToDriver(driverId, busId) {
    const t = await sequelize.transaction();
    console.log(
      `[driverService.assignBusToDriver] start driverId=${driverId} busId=${busId}`
    );
    try {
      const driver = await Driver.findByPk(driverId, { transaction: t });
      const bus = busId ? await Bus.findByPk(busId, { transaction: t }) : null;

      console.log(
        `[driverService.assignBusToDriver] fetched driver=${
          driver ? driver.id : null
        } bus=${bus ? bus.id : null}`
      );

      if (!driver) {
        console.warn(
          `[driverService.assignBusToDriver] Driver not found id=${driverId}`
        );
        throw new Error("Driver not found.");
      }
      if (busId && !bus) {
        console.warn(
          `[driverService.assignBusToDriver] Bus not found id=${busId}`
        );
        throw new Error("Bus not found.");
      }

      // Nếu driver đang phụ trách 1 xe khác, bỏ driver trên xe đó
      const currentBusOfDriver = driver.current_bus_id || driver.currentBusId;
      console.log(
        `[driverService.assignBusToDriver] currentBusOfDriver=${currentBusOfDriver}`
      );
      if (currentBusOfDriver && currentBusOfDriver !== busId) {
        console.log(
          `[driverService.assignBusToDriver] clearing driver from bus id=${currentBusOfDriver}`
        );
        await Bus.update(
          { driver_id: null },
          { where: { id: currentBusOfDriver }, transaction: t }
        );
      }

      // Nếu bus đã có driver khác, bỏ bus khỏi driver cũ
      if (bus && bus.driver_id && bus.driver_id !== driverId) {
        console.log(
          `[driverService.assignBusToDriver] bus ${busId} currently assigned to driver ${bus.driver_id}, clearing`
        );
        await Driver.update(
          { current_bus_id: null, status: "OFF_DUTY" },
          { where: { id: bus.driver_id }, transaction: t }
        );
      }

      // Cập nhật driver hiện tại
      console.log(
        `[driverService.assignBusToDriver] setting driver ${driverId} current_bus_id=${busId}`
      );
      await Driver.update(
        {
          current_bus_id: busId || null,
          status: busId ? "DRIVING" : "OFF_DUTY",
        },
        { where: { id: driverId }, transaction: t }
      );

      // Cập nhật bus (nếu gán)
      if (bus) {
        console.log(
          `[driverService.assignBusToDriver] setting bus ${busId} driver_id=${driverId}`
        );
        await Bus.update(
          { driver_id: driverId },
          { where: { id: busId }, transaction: t }
        );
      }

      await t.commit();
      console.log(
        `[driverService.assignBusToDriver] commit success for driverId=${driverId} busId=${busId}`
      );
      return {
        message: busId
          ? `Assigned Bus ${busId} to Driver ${driverId}`
          : `Unassigned Bus from Driver ${driverId}`,
      };
    } catch (error) {
      try {
        await t.rollback();
        console.log(
          `[driverService.assignBusToDriver] transaction rolled back for driverId=${driverId} busId=${busId}`
        );
      } catch (rbErr) {
        console.error(
          `[driverService.assignBusToDriver] rollback error: ${rbErr.message}`
        );
      }
      console.error(
        `[driverService.assignBusToDriver] error: ${error.message}`
      );
      throw error;
    }
  },

  // 7. Lấy danh sách tài xế chưa có xe phụ trách
  async getAvailableDrivers() {
    return Driver.findAll({
      where: { current_bus_id: null },
      attributes: [
        "id",
        "full_name",
        "phone",
        "license_number",
        "status",
        ["user_id", "userId"],
      ],
      include: [
        {
          model: User,
          as: "UserAccount",
          attributes: ["username"],
          required: false,
        },
      ],
      order: [["full_name", "ASC"]],
    });
  },
};

module.exports = driverService;
