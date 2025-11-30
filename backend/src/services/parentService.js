// backend/src/services/parentService.js

const { Parent, Student, User, Bus, Location } = require("../db");
const { sequelize } = require("../db");
const bcrypt = require("bcryptjs");
const config = require("../config/app.config");

const parentService = {
  // 1. Lấy danh sách Phụ huynh kèm danh sách Học sinh (ĐÃ FIX)
  async getAllParentsWithStudents() {
    return Parent.findAll({
      // 1. CHỈ ĐỊNH ATTRIBUTES CHO PARENT: Loại bỏ user_id dư thừa
      attributes: [
        "id",
        "fullName",
        "phone",
        "address",
        "userId", // Giữ lại khóa ngoại camelCase
      ],
      include: [
        {
          model: Student,
          as: "Students",
          required: false, // 2. CHỈ ĐỊNH ATTRIBUTES CHO STUDENT: Loại bỏ các FK dư thừa
          attributes: [
            "id",
            "name",
            "className",
            "grade",
            "parentContact",
            "status",
            "assignedBusId", // Giữ lại khóa ngoại camelCase
            "pickupLocationId", // Giữ lại khóa ngoại camelCase
            "dropoffLocationId", // Giữ lại khóa ngoại camelCase // Bỏ qua parentId vì đã được lồng trong Parent
          ],
        },
      ],
      order: [["fullName", "ASC"]],
    });
  }, // 2. Lấy chi tiết Học sinh kèm tất cả thông tin liên quan (Bus, Locations, Parent)

  async getStudentDetail(studentId) {
    return Student.findByPk(studentId, {
      // 3. CHỈ ĐỊNH ATTRIBUTES CHO STUDENT trong findByPk
      attributes: [
        "id",
        "name",
        "className",
        "grade",
        "parentContact",
        "status",
        "assignedBusId",
        "pickupLocationId",
        "dropoffLocationId",
      ],
      include: [
        {
          model: Parent,
          as: "Parent",
          attributes: ["id", "fullName", "phone"],
        },
        {
          model: Bus,
          as: "AssignedBus",
          // Chú ý: Cột SQL là license_plate, nên dùng snake_case trong attributes của Model liên kết
          attributes: ["id", "license_plate"],
        },
        {
          model: Location,
          as: "PickupLocation",
          // Bỏ qua các khóa ngoại không cần thiết
          attributes: ["id", "name", "address", "latitude", "longitude"],
        },
        {
          model: Location,
          as: "DropoffLocation",
          attributes: ["id", "name", "address", "latitude", "longitude"],
        },
      ],
    });
  }, // 3. Nghiệp vụ phức tạp: Tạo Tài khoản User, Phụ huynh, và Học sinh trong 1 Transaction

  async createParentAndStudent(userData, parentData, studentData) {
    const t = await sequelize.transaction();
    try {
      // Bước 1: Tạo User
      // Nếu client không cung cấp `id`, tạo ID tạm thời ở backend để đảm bảo trường NOT NULL
      const userId = (userData && userData.id) || `U${Date.now()}`;
      // Ensure password is hashed before creating User
      const rawPassword = (userData && userData.password) || "123456";
      const hashedPassword = await bcrypt.hash(rawPassword, config.SALT_ROUNDS);
      const userPayload = {
        id: userId,
        ...userData,
        password: hashedPassword,
        role: "parent",
      };
      const newUser = await User.create(userPayload, { transaction: t });

      // Bước 2: Tạo Parent (tạo id nếu client không cung cấp)
      const parentId =
        (parentData && (parentData.id || parentData.parent_id)) ||
        `P${Date.now()}`;
      const newParent = await Parent.create(
        {
          id: parentId,
          ...parentData,
          userId: newUser.id,
        },
        { transaction: t }
      ); // Bước 3: Tạo Student
      let newStudent = null;
      if (studentData && Object.keys(studentData).length > 0) {
        newStudent = await Student.create(
          {
            ...studentData,
            parentId: newParent.id,
          },
          { transaction: t }
        );
      }

      await t.commit();
      return { parent: newParent, student: newStudent, user: newUser };
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }, // Thêm hàm lấy Parent theo ID nếu cần
  async getParentById(id) {
    return Parent.findByPk(id, {
      // 4. CHỈ ĐỊNH ATTRIBUTES CHO PARENT trong findByPk
      attributes: ["id", "fullName", "phone", "address", "userId"],
      include: [
        {
          model: Student,
          as: "Students",
          required: false,
          // 5. CHỈ ĐỊNH ATTRIBUTES CHO STUDENT lồng ghép
          attributes: [
            "id",
            "name",
            "className",
            "grade",
            "parentContact",
            "status",
            "assignedBusId",
            "pickupLocationId",
            "dropoffLocationId",
          ],
        },
      ],
    });
  },
  // Cập nhật Parent theo id
  async updateParent(id, parentData) {
    const payload = {};
    if (parentData.full_name || parentData.fullName)
      payload.fullName = parentData.full_name || parentData.fullName;
    if (typeof parentData.phone !== "undefined")
      payload.phone = parentData.phone;
    if (typeof parentData.address !== "undefined")
      payload.address = parentData.address;

    const [affected] = await Parent.update(payload, { where: { id } });
    if (affected === 0) return null;
    return Parent.findByPk(id, {
      attributes: ["id", "fullName", "phone", "address", "userId"],
    });
  },
  // Tạo Parent liên kết với user đã tồn tại
  async createParentForUser(userId, parentData) {
    // parentData may contain full_name, phone, address, id
    const payload = {
      id: parentData.id || `P${Date.now()}`,
      fullName: parentData.full_name || parentData.fullName || null,
      phone: parentData.phone || null,
      address: parentData.address || null,
      userId: userId,
    };

    const newParent = await Parent.create(payload);
    return newParent;
  },
};

module.exports = parentService;
