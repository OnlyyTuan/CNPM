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

  // 6. API cho tài xế: Lấy xe của tài xế đang đăng nhập
  async getMyBuses(req, res, next) {
    try {
      const userId = req.user.id; // Từ verifyToken middleware

      // Tìm driver từ user_id
      const driver = await db.Driver.findOne({
        where: { userId: userId },
        include: [
          {
            model: db.Bus,
            as: "CurrentBus",
            include: [
              {
                model: db.Route,
                as: "CurrentRoute",
                attributes: ["id", "routeName"],
              },
              {
                model: db.Location,
                as: "CurrentLocation",
                attributes: ["id", "name", "latitude", "longitude"],
              },
            ],
          },
        ],
      });

      if (!driver) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy thông tin tài xế",
        });
      }

      // Lấy xe được gán cho tài xế này
      const buses = await db.Bus.findAll({
        where: { driver_id: driver.id },
        include: [
          {
            model: db.Driver,
            as: "CurrentDriver",
            attributes: ["id", "fullName", "phone"],
          },
          {
            model: db.Route,
            as: "CurrentRoute",
            attributes: ["id", "routeName"],
          },
          {
            model: db.Location,
            as: "CurrentLocation",
            attributes: ["id", "name", "latitude", "longitude"],
          },
        ],
      });

      res.status(200).json({
        success: true,
        data: buses,
      });
    } catch (error) {
      console.error("Lỗi khi lấy xe của tài xế:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi khi lấy thông tin xe",
        error: error.message,
      });
    }
  },

  // 7. API cho tài xế: Lấy học sinh trên xe của tài xế
  async getMyStudents(req, res, next) {
    try {
      const userId = req.user.id;

      // Tìm driver
      const driver = await db.Driver.findOne({
        where: { userId: userId },
      });

      if (!driver) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy thông tin tài xế",
        });
      }

      // Lấy xe của tài xế
      const buses = await db.Bus.findAll({
        where: { driver_id: driver.id },
        attributes: ["id"],
      });

      if (!buses || buses.length === 0) {
        return res.status(200).json({
          success: true,
          data: [],
          message: "Bạn chưa được gán xe nào",
        });
      }

      const busIds = buses.map((b) => b.id);

      // Lấy học sinh được gán vào các xe này
      const dbConnection = require("../database");
      const [students] = await dbConnection.query(
        `
        SELECT 
          s.*,
          b.id as bus_id,
          b.license_plate as bus_license_plate,
          b.capacity as bus_capacity,
          pl.id as pickup_location_id,
          pl.name as pickup_location_name,
          pl.address as pickup_location_address,
          dl.id as dropoff_location_id,
          dl.name as dropoff_location_name,
          dl.address as dropoff_location_address,
          p.id as parent_id,
          p.full_name as parent_name,
          p.phone as parent_phone
        FROM student s
        LEFT JOIN bus b ON s.assigned_bus_id = b.id
        LEFT JOIN location pl ON s.pickup_location_id = pl.id
        LEFT JOIN location dl ON s.dropoff_location_id = dl.id
        LEFT JOIN parent p ON s.parent_id = p.id
        WHERE s.assigned_bus_id IN (?)
        ORDER BY s.full_name ASC
      `,
        [busIds]
      );

      res.status(200).json({
        success: true,
        data: students,
      });
    } catch (error) {
      console.error("Lỗi khi lấy học sinh của tài xế:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi khi lấy danh sách học sinh",
        error: error.message,
      });
    }
  },

  // 8. Tài xế cập nhật trạng thái học sinh: 'pickup' (đã đón) hoặc 'dropoff' (đã tới)
  async updateStudentStatus(req, res, next) {
    try {
      const userId = req.user.id;
      const studentId = req.params.id;
      const { action } = req.body; // expected: 'pickup' or 'dropoff'

      if (!action || !["pickup", "dropoff"].includes(action)) {
        return res
          .status(400)
          .json({ success: false, message: "Hành động không hợp lệ" });
      }

      // Tìm driver theo user
      const driver = await db.Driver.findOne({ where: { userId: userId } });
      if (!driver) {
        return res
          .status(404)
          .json({ success: false, message: "Không tìm thấy tài xế" });
      }

      // Lấy danh sách bus id của driver
      const buses = await db.Bus.findAll({
        where: { driver_id: driver.id },
        attributes: ["id"],
      });
      const busIds = (buses || []).map((b) => b.id);

      if (busIds.length === 0) {
        return res
          .status(400)
          .json({ success: false, message: "Bạn chưa được gán xe nào" });
      }

      // Tìm student và đảm bảo student.assigned_bus_id thuộc về busIds
      const student = await db.Student.findOne({ where: { id: studentId } });
      if (!student) {
        return res
          .status(404)
          .json({ success: false, message: "Không tìm thấy học sinh" });
      }

      const assignedBusId =
        student.assigned_bus_id ||
        student.assignedBusId ||
        student.assigned_bus ||
        null;
      if (!assignedBusId || !busIds.includes(assignedBusId)) {
        return res.status(403).json({
          success: false,
          message: "Bạn không có quyền cập nhật học sinh này",
        });
      }

      // Thực hiện cập nhật theo action
      if (action === "pickup") {
        await db.Student.update(
          { status: "IN_BUS" },
          { where: { id: studentId } }
        );
      } else if (action === "dropoff") {
        // Khi đã tới nơi, đánh dấu 'ARRIVED' và gỡ assigned_bus_id để học sinh không còn hiện trên danh sách tài xế
        await db.Student.update(
          { status: "ARRIVED", assigned_bus_id: null },
          { where: { id: studentId } }
        );
      }

      return res
        .status(200)
        .json({ success: true, message: "Cập nhật trạng thái thành công" });
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái học sinh:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi hệ thống",
        error: error.message,
      });
    }
  },
};

module.exports = driverController;
