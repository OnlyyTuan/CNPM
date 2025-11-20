// backend/src/services/studentService.js

const { Student, Parent, Bus, Location, sequelize } = require("../db");

const studentService = {
  // 1. [GET] Lấy tất cả học sinh (kèm thông tin Parent, Bus và Locations)
  async findAllStudents() {
    return Student.findAll({
      attributes: [
        "id",
        "name",
        "className",
        "grade",
        "status",
        "parentId",
        "assignedBusId",
      ],
      include: [
        {
          model: Parent,
          as: "Parent",
          attributes: ["id", "fullName", "phone"],
          required: false,
        },
        {
          model: Bus,
          as: "AssignedBus",
          attributes: ["id", "license_plate"],
          required: false,
        },
        {
          model: Location,
          as: "PickupLocation",
          attributes: ["id", "name", "address"],
          required: false,
        },
        {
          model: Location,
          as: "DropoffLocation",
          attributes: ["id", "name", "address"],
          required: false,
        },
      ],
      order: [["name", "ASC"]],
    });
  },

  // 2. [GET] Lấy chi tiết học sinh theo ID
  async findStudentById(id) {
    return Student.findByPk(id, {
      include: [
        {
          model: Parent,
          as: "Parent",
          attributes: ["id", "fullName", "phone", "address"],
        },
        {
          model: Bus,
          as: "AssignedBus",
          attributes: ["id", "license_plate", "capacity"],
        },
        {
          model: Location,
          as: "PickupLocation",
          attributes: ["id", "name", "address", "latitude", "longitude"],
        },
        {
          model: Location,
          as: "DropoffLocation",
          attributes: ["id", "name", "address", "latitude", "longitude"],
        },
      ],
    });
  },

  // 3. [POST] Tạo học sinh mới
  // Lưu ý: Trong nghiệp vụ thực tế, tạo học sinh thường đi kèm tạo Parent (đã làm trong parentService)
  // Hàm này dành cho Admin chỉ muốn tạo học sinh mà Parent đã tồn tại.
  async createStudent(studentData) {
    // Kiểm tra ParentId có tồn tại không
    if (studentData.parentId) {
      const parent = await Parent.findByPk(studentData.parentId);
      if (!parent) {
        throw new Error("Không tìm thấy ID Phụ huynh liên kết.");
      }
    }

    return Student.create(studentData);
  },

  // 4. [PUT] Cập nhật thông tin học sinh
  async updateStudent(id, studentData) {
    const student = await Student.findByPk(id);
    if (!student) {
      throw new Error("Không tìm thấy học sinh.");
    }

    // Kiểm tra ParentId nếu được cập nhật
    if (studentData.parentId && studentData.parentId !== student.parentId) {
      const parent = await Parent.findByPk(studentData.parentId);
      if (!parent) {
        throw new Error("Không tìm thấy ID Phụ huynh liên kết mới.");
      }
    }

    const [updatedRows] = await Student.update(studentData, {
      where: { id: id },
      returning: true,
    });

    if (updatedRows === 0) {
      throw new Error("Cập nhật thất bại.");
    }

    // Lấy lại đối tượng đã cập nhật để trả về
    return this.findStudentById(id);
  },

  // 5. [DELETE] Xóa học sinh
  async deleteStudent(id) {
    const student = await Student.findByPk(id);
    if (!student) {
      throw new Error("Không tìm thấy học sinh.");
    }

    // Tùy chọn: Thêm logic kiểm tra nếu học sinh đang trên xe (status == 'IN_BUS')
    // if (student.status === 'IN_BUS') {
    //     throw new Error('Không thể xóa học sinh đang trên xe.');
    // }

    await Student.destroy({ where: { id: id } });
    return { message: "Xóa học sinh thành công." };
  },

  // 6. [PATCH] Cập nhật trạng thái/Vị trí (Dùng cho Driver App hoặc Hệ thống)
  async updateStudentStatus(id, newStatus, newLocationData = {}) {
    const student = await Student.findByPk(id);
    if (!student) {
      throw new Error("Không tìm thấy học sinh.");
    }

    const updateFields = { status: newStatus, ...newLocationData };

    await Student.update(updateFields, { where: { id: id } });

    return this.findStudentById(id);
  },
};

module.exports = studentService;
