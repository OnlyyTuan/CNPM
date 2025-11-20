// backend/src/controllers/studentController.js
const db = require("../database"); // Import database connection

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

      // Nếu không có parent_id, dùng DEFAULT_PARENT
      const finalParentId = parent_id || "DEFAULT_PARENT";

      // Chỉ insert các field được cung cấp
      await db.query(
        `
                        INSERT INTO student (id, full_name, class, grade, parent_contact, address, status, parent_id, assigned_bus_id, pickup_location_id, dropoff_location_id)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
        [
          id,
          full_name,
          studentClass || null,
          grade || null,
          parent_contact || null,
          address || null,
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
      if (address !== undefined) {
        updateFields.push("address = ?");
        updateValues.push(address);
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
};

module.exports = studentController;
