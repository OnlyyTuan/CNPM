const { sequelize, Driver, Bus } = require("../db");

const driverService = {
  // 1. Lấy danh sách Tài xế kèm thông tin Xe buýt (Dùng cho GET /api/v1/drivers)
  async getAllDriversWithBus() {
    return Driver.findAll({
      attributes: [
        "id",
        "full_name",
        "phone",
        "license_number",
        "status",
        ["current_bus_id", "currentBusId"],
        ["user_id", "userId"]
      ],
      include: [
        {
          model: Bus,
          as: "CurrentBus", // BÍ DANH ĐÃ ĐÚNG
          attributes: ["id", "license_plate", "capacity", "status"], // Chọn các cột cần thiết từ Bus
          required: false,
        },
      ],
      order: [["full_name", "ASC"]], // Sắp xếp theo tên (Dùng tên cột SQL: full_name)
    });
  }, // 2. Lấy chi tiết tài xế theo ID

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
          attributes: ["id", "license_plate", "capacity", "status"],
          required: false,
        },
      ],
    });
  }, // 3. Tạo tài xế mới (CRUD cơ bản) // Lưu ý: Dữ liệu đầu vào phải là dạng camelCase (ví dụ: fullName)

  async createDriver(data) {
    return Driver.create(data);
  }, // 4. Cập nhật thông tin tài xế (CRUD cơ bản)

  async updateDriver(id, data) {
    const [updated] = await Driver.update(data, {
      where: { id: id },
    });
    if (updated) {
      return this.getDriverById(id);
    }
    return null;
  }, // 5. Xóa tài xế (CRUD cơ bản)

  async deleteDriver(id) {
    return Driver.destroy({
      where: { id: id },
    });
  }, // 6. Logic gán/hủy gán Xe buýt và Tài xế (Transaction)

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
      } // Do trong Model Driver bạn đang dùng currentBusId (camelCase) và underscored: true, // Sequelize tự động ánh xạ nó thành current_bus_id trong DB. // Tuy nhiên, khi truy cập instance trong code JS, nó vẫn dùng currentBusId (hoặc current_bus_id nếu không được ánh xạ). // Sử dụng `driver.get('currentBusId')` hoặc dựa vào tên thuộc tính đã được ánh xạ (currentBusId)

      const currentBusOfDriver = driver.currentBusId || driver.current_bus_id; // 2. Hủy gán xe cũ của tài xế (nếu có)

      if (currentBusOfDriver && currentBusOfDriver !== busId) {
        await Bus.update(
          { driver_id: null },
          { where: { id: currentBusOfDriver }, transaction: t }
        );
      } // 3. Hủy gán tài xế cũ của xe buýt mục tiêu

      if (bus && bus.driver_id && bus.driver_id !== driverId) {
        await Driver.update(
          { currentBusId: null, status: "OFF_DUTY" }, // Cập nhật bằng tên thuộc tính JS
          { where: { id: bus.driver_id }, transaction: t }
        );
      } // 4. Gán Tài xế mới vào Xe buýt (hoặc hủy gán nếu busId là null)

      await Driver.update(
        {
          currentBusId: busId, // Cập nhật bằng tên thuộc tính JS
          status: busId ? "DRIVING" : "OFF_DUTY",
        },
        { where: { id: driverId }, transaction: t }
      ); // 5. Gán Xe buýt cho Tài xế mới

      if (bus) {
        await Bus.update(
          { driver_id: driverId }, // Cập nhật bằng tên cột SQL
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
