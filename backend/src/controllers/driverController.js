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

  // 6. API cho tài xế: Lấy xe của tài xế đang đăng nhập
  async getMyBuses(req, res, next) {
    try {
      const userId = req.user.id; // Từ verifyToken middleware
      
      // Tìm driver từ user_id
      const driver = await db.Driver.findOne({
        where: { userId: userId },
        include: [{
          model: db.Bus,
          as: 'CurrentBus',
          include: [
            {
              model: db.Route,
              as: 'CurrentRoute',
              attributes: ['id', 'routeName']
            },
            {
              model: db.Location,
              as: 'CurrentLocation',
              attributes: ['id', 'name', 'latitude', 'longitude']
            }
          ]
        }]
      });

      if (!driver) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy thông tin tài xế"
        });
      }

      // Lấy xe được gán cho tài xế này
      const buses = await db.Bus.findAll({
        where: { driver_id: driver.id },
        include: [
          {
            model: db.Driver,
            as: 'CurrentDriver',
            attributes: ['id', 'fullName', 'phone']
          },
          {
            model: db.Route,
            as: 'CurrentRoute',
            attributes: ['id', 'routeName']
          },
          {
            model: db.Location,
            as: 'CurrentLocation',
            attributes: ['id', 'name', 'latitude', 'longitude']
          }
        ]
      });

      res.status(200).json({
        success: true,
        data: buses
      });
    } catch (error) {
      console.error("Lỗi khi lấy xe của tài xế:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi khi lấy thông tin xe",
        error: error.message
      });
    }
  },

  // 7. API cho tài xế: Lấy học sinh trên xe của tài xế
  async getMyStudents(req, res, next) {
    try {
      const userId = req.user.id;
      
      // Tìm driver
      const driver = await db.Driver.findOne({
        where: { userId: userId }
      });

      if (!driver) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy thông tin tài xế"
        });
      }

      // Lấy xe của tài xế
      const buses = await db.Bus.findAll({
        where: { driver_id: driver.id },
        attributes: ['id']
      });

      if (!buses || buses.length === 0) {
        return res.status(200).json({
          success: true,
          data: [],
          message: "Bạn chưa được gán xe nào"
        });
      }

      const busIds = buses.map(b => b.id);

      // Lấy học sinh được gán vào các xe này
      const dbConnection = require("../database");
      const [students] = await dbConnection.query(`
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
      `, [busIds]);

      res.status(200).json({
        success: true,
        data: students
      });
    } catch (error) {
      console.error("Lỗi khi lấy học sinh của tài xế:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi khi lấy danh sách học sinh",
        error: error.message
      });
    }
  },
};

module.exports = driverController;
