// backend/src/controllers/busController.js
// Vẫn giữ require ở đây để Models được định nghĩa trước khi sử dụng
const db = require("../db");
const { Bus, Driver, Route, Location } = db;

// require driverService for assignment helper
const driverService = require("../services/driverService");

const busController = {
  // [GET] /api/v1/buses - Lấy danh sách xe buýt
  async findAll(req, res) {
    try {
      const buses = await Bus.findAll({
        // PHẢI DÙNG BÍ DANH (AS) ĐÃ ĐỊNH NGHĨA TRONG DB.JS
        include: [
          {
            model: Driver,
            as: "CurrentDriver", // SỬA: Dùng bí danh CurrentDriver
            attributes: ["id", "full_name", "phone"], // Lưu ý: dùng full_name thay vì name
            required: false,
          },
          {
            model: Route,
            as: "CurrentRoute", // SỬA: Dùng bí danh CurrentRoute
            attributes: ["id", "route_name"], // Lưu ý: dùng route_name thay vì name
            required: false,
          },
          {
            model: Location,
            as: "CurrentLocation", // ĐÃ ĐÚNG
            attributes: ["id", "name", "latitude", "longitude"],
            required: false,
          },
        ],
        order: [["license_plate", "ASC"]], // Sắp xếp theo biển số xe
      });
      res.send(buses);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách xe buýt:", error.message);
      res.status(500).send({
        message: "Lỗi khi lấy danh sách xe buýt.",
        error: error.message,
      });
    }
  },

  // [POST] /api/v1/buses - Thêm xe buýt mới
  async create(req, res) {
    const {
      id,
      license_plate,
      capacity,
      status,
      driver_id,
      route_id,
      current_location_id,
    } = req.body;
    try {
      const newBus = await Bus.create({
        id: id,
        license_plate: license_plate, // Cần có license_plate
        capacity: capacity,
        status: status || "ACTIVE",
        // Các FK có thể được tạo cùng lúc nếu driver_id, route_id, location_id có trong req.body
      });
      res.status(201).send(newBus);
    } catch (error) {
      // Lỗi 400 cho lỗi validation hoặc trùng khóa chính/duy nhất
      res.status(400).send({
        message: "Lỗi khi tạo xe buýt mới. (Có thể trùng ID hoặc biển số)",
        error: error.message,
      });
    }
  },

  // [PUT] /api/v1/buses/:id - Cập nhật thông tin xe buýt
  async update(req, res) {
    const { id } = req.params;
    const updateData = req.body;
    console.log(
      `[busController.update] Updating bus id=${id}, data=`,
      updateData
    );
    try {
      // Loại bỏ các trường không cho phép update trực tiếp
      delete updateData.current_location_id;

      // Nếu request có driver_id thì sử dụng driverService.assignBusToDriver
      // để đảm bảo cả 2 phía (Bus.driver_id và Driver.current_bus_id) được đồng bộ
      if (Object.prototype.hasOwnProperty.call(updateData, "driver_id")) {
        const newDriverId = updateData.driver_id || null;
        // Sử dụng service để xử lý toàn bộ logic gán/hủy gán
        await driverService.assignBusToDriver(newDriverId, id);
        // Sau khi assign, lấy lại bus cùng các quan hệ
        const updatedBus = await Bus.findByPk(id, {
          include: [
            {
              model: Driver,
              as: "CurrentDriver",
              attributes: ["id", "full_name", "phone"],
              required: false,
            },
            {
              model: Route,
              as: "CurrentRoute",
              attributes: ["id", "route_name"],
              required: false,
            },
            {
              model: Location,
              as: "CurrentLocation",
              attributes: ["id", "name", "latitude", "longitude"],
              required: false,
            },
          ],
        });
        console.log(
          `[busController.update] Assigned driver via update for bus id=${id}`
        );
        return res.send(updatedBus);
      }

      // Nếu không thay driver, cập nhật các trường khác như bình thường
      const [updated] = await Bus.update(updateData, {
        where: { id: id },
      });

      if (updated) {
        const updatedBus = await Bus.findByPk(id, {
          include: [
            {
              model: Driver,
              as: "CurrentDriver",
              attributes: ["id", "full_name", "phone"],
              required: false,
            },
            {
              model: Route,
              as: "CurrentRoute",
              attributes: ["id", "route_name"],
              required: false,
            },
            {
              model: Location,
              as: "CurrentLocation",
              attributes: ["id", "name", "latitude", "longitude"],
              required: false,
            },
          ],
        });
        console.log(`[busController.update] Updated bus id=${id}`);
        res.send(updatedBus);
      } else {
        console.warn(`[busController.update] Bus not found id=${id}`);
        res.status(404).send({ message: "Không tìm thấy xe buýt." });
      }
    } catch (error) {
      console.error(
        `[busController.update] Error updating bus id=${id}:`,
        error
      );
      // Handle Sequelize validation / unique constraint errors as 400
      if (
        error.name === "SequelizeValidationError" ||
        error.name === "SequelizeUniqueConstraintError"
      ) {
        const details = error.errors ? error.errors.map((e) => e.message) : [];
        return res.status(400).send({
          message: "Dữ liệu không hợp lệ khi cập nhật xe buýt.",
          error: error.message,
          details,
        });
      }

      res
        .status(500)
        .send({ message: "Lỗi khi cập nhật xe buýt.", error: error.message });
    }
  },

  // [PUT] /api/v1/buses/:id/assign-driver - Gán tài xế cho xe buýt
  async assignDriver(req, res) {
    const { id } = req.params; // Bus ID
    const { driverId } = req.body;
    try {
      // Kiểm tra bus tồn tại trước khi gọi service để có thông báo rõ ràng
      const { Bus } = require("../db");
      const bus = await Bus.findByPk(id);
      if (!bus) {
        console.warn(`AssignDriver: bus not found id=${id}`);
        return res
          .status(404)
          .send({ message: `Không tìm thấy xe buýt id=${id}` });
      }

      const driverService = require("../services/driverService");
      await driverService.assignBusToDriver(driverId, id);
      res
        .status(200)
        .send({ message: `Gán tài xế ${driverId} cho xe ${id} thành công.` });
    } catch (error) {
      res.status(400).send({
        message: "Lỗi khi gán tài xế.",
        error: error.message,
      });
    }
  },

  // [DELETE] /api/v1/buses/:id - Xóa xe buýt
  async delete(req, res) {
    const { id } = req.params;
    try {
      const result = await Bus.destroy({
        where: { id: id },
      });

      if (result) {
        res.status(200).send({ message: "Xóa xe buýt thành công." });
      } else {
        res.status(404).send({ message: "Không tìm thấy xe buýt." });
      }
    } catch (error) {
      res.status(500).send({
        message: "Lỗi khi xóa xe buýt. Vui lòng kiểm tra các ràng buộc.",
        error: error.message,
      });
    }
  },

  // [GET] /api/v1/buses/live-location - Danh sách vị trí hiện tại của xe
  async getLiveLocations(req, res) {
    try {
      // Ngăn cache để luôn trả về dữ liệu mới nhất
      res.set(
        "Cache-Control",
        "no-store, no-cache, must-revalidate, proxy-revalidate"
      );
      res.set("Pragma", "no-cache");
      res.set("Expires", "0");

      // Query trực tiếp từ DB, tắt cache của Sequelize
      const buses = await Bus.findAll({
        attributes: ["id", "license_plate", "speed", "current_location_id", "route_id"],
        include: [
          {
            model: Location,
            as: "CurrentLocation",
            attributes: ["id", "latitude", "longitude"],
            required: false,
          },
          {
            model: Route,
            as: "CurrentRoute",
            attributes: ["id", "routeName"],
            required: false,
          },
        ],
        order: [["license_plate", "ASC"]],
        raw: false,
        nest: true,
        // Buộc reload từ DB mỗi lần
        rejectOnEmpty: false,
        useMaster: true,
      });

      const payload = buses.map((b) => ({
        id: b.id,
        licensePlate: b.license_plate,
        speed: b.speed ? Number(b.speed) : null,
        lat: b.CurrentLocation ? Number(b.CurrentLocation.latitude) : null,
        lng: b.CurrentLocation ? Number(b.CurrentLocation.longitude) : null,
        routeId: b.route_id,
        routeName: b.CurrentRoute ? b.CurrentRoute.routeName : null,
      }));

      console.log(
        `[${new Date().toISOString()}] Live locations:`,
        JSON.stringify(payload)
      );
      res.status(200).json(payload);
    } catch (error) {
      console.error("Lỗi khi lấy live locations:", error.message);
      res.status(500).json({ message: "Không thể lấy vị trí trực tiếp." });
    }
  },

  // [PUT] /api/v1/buses/:id/location - Cập nhật vị trí hiện tại của xe (admin/driver)
  async updateLocation(req, res) {
    const { id } = req.params; // bus id
    const { latitude, longitude, speed } = req.body || {};
    if (latitude == null || longitude == null) {
      return res.status(400).json({ message: "Thiếu latitude/longitude" });
    }
    try {
      const bus = await Bus.findByPk(id);
      if (!bus)
        return res.status(404).json({ message: "Không tìm thấy xe buýt" });

      // Đảm bảo có 1 Location hiện hành cho bus để JOIN nhanh
      let locId = bus.current_location_id;
      if (!locId) {
        locId = `CUR_${id}`; // id ổn định theo bus
        // Tạo mới nếu chưa có
        await Location.create({
          id: locId,
          name: `Current of ${id}`,
          latitude,
          longitude,
          type: "bus_current",
        });
        await Bus.update({ current_location_id: locId }, { where: { id } });
      } else {
        // Cập nhật tọa độ vị trí hiện hành
        const updated = await Location.update(
          { latitude, longitude },
          { where: { id: locId } }
        );
        console.log(
          `✅ Đã cập nhật Location ${locId}: lat=${latitude}, lng=${longitude}, rows affected=${updated[0]}`
        );
      }

      // Cập nhật tốc độ (nếu gửi kèm)
      if (speed != null) {
        await Bus.update({ speed }, { where: { id } });
        console.log(`✅ Đã cập nhật speed=${speed} cho bus ${id}`);
      }

      // Tuỳ chọn: ghi log lịch sử (nếu có bảng LocationLog)
      try {
        await db.sequelize.query(
          "INSERT INTO locationlog (bus_id, timestamp, latitude, longitude, speed) VALUES (?, CURRENT_TIMESTAMP, ?, ?, ?)",
          { replacements: [id, latitude, longitude, speed ?? null] }
        );
      } catch (logErr) {
        // Không chặn quy trình chính nếu bảng không tồn tại
        console.warn("Ghi log vị trí thất bại (bỏ qua):", logErr.message);
      }

      // Trả về dữ liệu mới nhất
      const updated = await Bus.findByPk(id, {
        attributes: ["id", "license_plate", "speed", "current_location_id"],
        include: [
          {
            model: Location,
            as: "CurrentLocation",
            attributes: ["id", "latitude", "longitude"],
          },
        ],
      });
      return res.status(200).json({
        id: updated.id,
        licensePlate: updated.license_plate,
        speed: updated.speed ? Number(updated.speed) : null,
        lat: updated.CurrentLocation
          ? Number(updated.CurrentLocation.latitude)
          : null,
        lng: updated.CurrentLocation
          ? Number(updated.CurrentLocation.longitude)
          : null,
      });
    } catch (error) {
      console.error("Lỗi cập nhật vị trí xe:", error.message);
      res.status(500).json({ message: "Không thể cập nhật vị trí xe." });
    }
  },
};

module.exports = busController;
