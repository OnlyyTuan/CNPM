// backend/src/controllers/studentController.js
const db = require("../database"); // Import database connection
const {
  validateStudentLocations,
  getStopsOnBusRoute,
} = require("../utils/studentValidation");
const userService = require("../services/userService");

const studentController = {
  // [GET] /api/v1/students - Lấy danh sách học sinh
  async findAll(req, res) {
    try {
      const [students] = await db.query(`
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
                ORDER BY s.full_name ASC
            `);

      res.json({
        success: true,
        data: students,
      });
    } catch (error) {
      console.error("Lỗi khi lấy danh sách học sinh:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi khi lấy danh sách học sinh.",
        error: error.message,
      });
    }
  },

  // [POST] /api/v1/students - Thêm học sinh mới
  async create(req, res) {
    try {
      const {
        id,
        full_name,
        class: studentClass,
        grade,
        parent_contact,
        address,
        status,
        parent_id,
        assigned_bus_id,
        pickup_location_id,
        dropoff_location_id,
      } = req.body;

      // Validate pickup/dropoff locations nếu có bus được phân công
      if (assigned_bus_id && (pickup_location_id || dropoff_location_id)) {
        const validation = await validateStudentLocations(
          assigned_bus_id,
          pickup_location_id,
          dropoff_location_id
        );

        if (!validation.valid) {
          return res.status(400).json({
            success: false,
            message: 'Dữ liệu không hợp lệ',
            errors: validation.errors,
          });
        }
      }

      // Xử lý parent: nếu frontend gửi parent_id thì dùng, nếu không gửi nhưng có parent_contact
      // thì tìm parent có cùng phone, nếu không có thì tạo parent mới (để tránh lỗi FK)
      let finalParentId = parent_id || null;
      if (!finalParentId) {
        if (parent_contact) {
          // Tìm parent theo phone
          const [existing] = await db.query(
            `SELECT id FROM parent WHERE phone = ? LIMIT 1`,
            [parent_contact]
          );
          if (existing && existing.length > 0) {
            finalParentId = existing[0].id;
          } else {
            // Nếu chưa có parent, tạo luôn 1 tài khoản user (required bởi schema)
            // và hồ sơ parent liên kết. Dùng userService để tạo transaction an toàn.
            try {
              const username = `parent_${parent_contact}`;
              const password = parent_contact || `p@ss${Date.now()}`;
              const email = `${parent_contact}@example.com`;

              const newUser = await userService.createUser({
                username,
                password,
                email,
                role: "parent",
                parentData: {
                  full_name: null,
                  phone: parent_contact,
                  address: null,
                },
              });

              // Lấy parent id vừa tạo liên kết với user mới
              const [pRows] = await db.query(
                `SELECT id FROM parent WHERE user_id = ? LIMIT 1`,
                [newUser.id]
              );
              if (pRows && pRows.length > 0) {
                finalParentId = pRows[0].id;
              } else {
                // fallback: tạo parent bằng raw query (ít khả năng xảy ra vì userService đã tạo parent)
                const newParentId = `P${Date.now()}`;
                await db.query(
                  `INSERT INTO parent (id, full_name, phone, user_id) VALUES (?, ?, ?, ?)`,
                  [newParentId, null, parent_contact, newUser.id]
                );
                finalParentId = newParentId;
              }
            } catch (err) {
              console.error("Lỗi khi tạo user/parent tự động:", err);
              // Nếu không thể tạo user/parent, trả lỗi để frontend biết
              return res.status(500).json({
                success: false,
                message: "Không thể tạo hồ sơ phụ huynh tự động",
                error: err.message,
              });
            }
          }
        } else {
          // Nếu không có parent_contact thì để NULL (DB có thể yêu cầu NOT NULL)
          finalParentId = null;
        }
      }

      // Chỉ insert các field được cung cấp
      await db.query(
        `
                        INSERT INTO student (id, full_name, class, grade, parent_contact, status, parent_id, assigned_bus_id, pickup_location_id, dropoff_location_id)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
        [
          id,
          full_name,
          studentClass || null,
          grade || null,
          parent_contact || null,
          status || "WAITING",
          finalParentId,
          assigned_bus_id || null,
          pickup_location_id || null,
          dropoff_location_id || null,
        ]
      );

      res.status(201).json({
        success: true,
        message: "Tạo học sinh mới thành công",
      });
    } catch (error) {
      console.error("Lỗi khi tạo học sinh:", error);
      res.status(400).json({
        success: false,
        message: "Lỗi khi tạo học sinh mới.",
        error: error.message,
      });
    }
  },

  // [PUT] /api/v1/students/:id - Cập nhật thông tin học sinh
  async update(req, res) {
    try {
      const { id } = req.params;
      const {
        full_name,
        class: studentClass,
        grade,
        parent_contact,
        address,
        status,
        parent_id,
        assigned_bus_id,
        pickup_location_id,
        dropoff_location_id,
      } = req.body;

      // Validate pickup/dropoff locations nếu có bus được phân công
      if (assigned_bus_id && (pickup_location_id || dropoff_location_id)) {
        const validation = await validateStudentLocations(
          assigned_bus_id,
          pickup_location_id,
          dropoff_location_id
        );

        if (!validation.valid) {
          return res.status(400).json({
            success: false,
            message: 'Dữ liệu không hợp lệ',
            errors: validation.errors,
          });
        }
      }

      // Xây dựng câu lệnh UPDATE động chỉ với các field được cung cấp
      const updateFields = [];
      const updateValues = [];

      if (full_name !== undefined) {
        updateFields.push("full_name = ?");
        updateValues.push(full_name);
      }
      if (studentClass !== undefined) {
        updateFields.push("class = ?");
        updateValues.push(studentClass);
      }
      if (grade !== undefined) {
        updateFields.push("grade = ?");
        updateValues.push(grade);
      }
      if (parent_contact !== undefined) {
        updateFields.push("parent_contact = ?");
        updateValues.push(parent_contact);
      }
      if (status !== undefined) {
        updateFields.push("status = ?");
        updateValues.push(status);
      }
      if (parent_id !== undefined) {
        updateFields.push("parent_id = ?");
        updateValues.push(parent_id);
      }
      if (assigned_bus_id !== undefined) {
        updateFields.push("assigned_bus_id = ?");
        updateValues.push(assigned_bus_id);
      }
      if (pickup_location_id !== undefined) {
        updateFields.push("pickup_location_id = ?");
        updateValues.push(pickup_location_id);
      }
      if (dropoff_location_id !== undefined) {
        updateFields.push("dropoff_location_id = ?");
        updateValues.push(dropoff_location_id);
      }

      if (updateFields.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Không có dữ liệu để cập nhật",
        });
      }

      updateValues.push(id);

      const [result] = await db.query(
        `UPDATE student SET ${updateFields.join(", ")} WHERE id = ?`,
        updateValues
      );

      if (result.affectedRows > 0) {
        res.json({
          success: true,
          message: "Cập nhật học sinh thành công",
        });
      } else {
        res.status(404).json({
          success: false,
          message: "Không tìm thấy học sinh.",
        });
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật học sinh:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi khi cập nhật học sinh.",
        error: error.message,
      });
    }
  },

  // [DELETE] /api/v1/students/:id - Xóa học sinh
  async delete(req, res) {
    try {
      const { id } = req.params;

      const [result] = await db.query("DELETE FROM student WHERE id = ?", [id]);

      if (result.affectedRows > 0) {
        res.json({
          success: true,
          message: "Xóa học sinh thành công.",
        });
      } else {
        res.status(404).json({
          success: false,
          message: "Không tìm thấy học sinh.",
        });
      }
    } catch (error) {
      console.error("Lỗi khi xóa học sinh:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi khi xóa học sinh.",
        error: error.message,
      });
    }
  },

  // [GET] /api/v1/students/bus/:busId/stops - Lấy danh sách stops trên tuyến của xe bus
  async getStopsForBus(req, res) {
    try {
      const { busId } = req.params;
      const stops = await getStopsOnBusRoute(busId);

      res.json({
        success: true,
        data: stops,
      });
    } catch (error) {
      console.error("Lỗi khi lấy stops:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi khi lấy danh sách stops.",
        error: error.message,
      });
    }
  },
  // backend/src/controllers/studentController.js
// Thêm hàm mới vào cuối object studentController (trước module.exports)

  // [GET] /api/v1/students/by-bus/:busId - Dành riêng cho trang lịch trình
  async getByBusId(req, res) {
    try {
      const { busId } = req.params;

      const [students] = await db.query(`
        SELECT
          s.id,
          s.full_name AS ho_ten_hs,
          s.class AS lop,
          l1.name AS diem_don,
          l2.name AS diem_tra,
          p.full_name AS ho_ten_phu_huynh,
          p.phone AS sdt_phu_huynh
        FROM student s
        LEFT JOIN location l1 ON s.pickup_location_id = l1.id
        LEFT JOIN location l2 ON s.dropoff_location_id = l2.id
        LEFT JOIN parent p ON s.parent_id = p.id
        WHERE s.assigned_bus_id = ?
        ORDER BY l1.name, s.full_name
      `, [busId]);

      res.json({
        success: true,
        data: students
      });
    } catch (error) {
      console.error("Lỗi khi lấy học sinh theo xe:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi server",
        error: error.message
      });
    }
  },
};

module.exports = studentController;
