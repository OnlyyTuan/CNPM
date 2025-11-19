// backend/src/services/userService.js
const bcrypt = require("bcryptjs");
const { sequelize, User, Driver } = require("../db"); // Import các models đã khởi tạo
const config = require("../config/app.config");

const userService = {
  /**
   * Tạo User (có thể là parent) và nếu role === 'parent' tạo Parent profile liên kết
   * @param {{username,password,email,role,parentData?}} userData
   */
  async createUser(userData) {
    const t = await sequelize.transaction();
    try {
      const userId = `U${Date.now()}`;

      const hashedPassword = await bcrypt.hash(
        userData.password,
        config.SALT_ROUNDS
      );

      const newUser = await User.create(
        {
          id: userId,
          username: userData.username,
          password: hashedPassword,
          email: userData.email || null,
          role: (userData.role || "parent").toLowerCase(),
        },
        { transaction: t }
      );

      let createdParent = null;
      if ((userData.role || "").toLowerCase() === "parent") {
        // tạo Parent profile liên kết
        const db = require("../db");
        const Parent = db.Parent;
        const parentId = `P${Date.now()}`;
        const p = userData.parentData || userData.parent || {};
        const parentPayload = {
          id: parentId,
          fullName: p.full_name || p.fullName || userData.full_name || "",
          phone: p.phone || "",
          address: p.address || "",
          userId: newUser.id,
        };
        createdParent = await Parent.create(parentPayload, { transaction: t });
      }

      await t.commit();

      // Trả về đối tượng user (nếu có parent, vẫn có thể truy vấn riêng)
      return newUser;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  },
  /** Tạo tài khoản User và hồ sơ Driver trong cùng 1 Transaction */
  async createDriverAndUser(userData, driverData) {
    // Bắt đầu Transaction
    const t = await sequelize.transaction();
    try {
      // 1. Tạo ID cho User (format: U + timestamp)
      const userId = `U${Date.now()}`;

      // 2. Băm mật khẩu
      const hashedPassword = await bcrypt.hash(
        userData.password,
        config.SALT_ROUNDS
      );

      // 3. Tạo bản ghi User (role: driver)
      const newUser = await User.create(
        {
          id: userId, // QUAN TRỌNG: Phải có ID
          ...userData,
          password: hashedPassword,
          role: "driver", // lowercase để match với enum
        },
        { transaction: t }
      );

      // 4. Tạo ID riêng cho Driver (format: DRV + timestamp)
      const driverId = `DRV${Date.now()}`;

      // 5. Tạo bản ghi Driver, liên kết với user_id
      // Map incoming driverData fields (may come from frontend as snake_case)
      const driverPayload = {
        id: driverId,
        fullName:
          driverData?.full_name ||
          driverData?.fullName ||
          driverData?.full_name,
        phone: driverData?.phone || null,
        licenseNumber:
          driverData?.license_number || driverData?.licenseNumber || null,
        userId: newUser.id, // use model attribute name; Sequelize will map to DB column
      };

      const newDriver = await Driver.create(driverPayload, { transaction: t });

      // Commit Transaction nếu cả hai bước thành công
      await t.commit();
      return { user: newUser, driver: newDriver };
    } catch (error) {
      // Rollback nếu có lỗi xảy ra
      await t.rollback();
      throw error;
    }
  },
  // Lấy tất cả users (id, username, email, role)
  async getAllUsers() {
    const { User } = require("../db");
    return User.findAll({
      attributes: ["id", "username", "email", "role"],
      order: [["username", "ASC"]],
    });
  },

  // Lấy user theo id
  async getUserById(id) {
    const { User } = require("../db");
    return User.findByPk(id, {
      attributes: ["id", "username", "email", "role"],
    });
  },

  // Cập nhật user theo id
  async updateUser(id, data) {
    const { User } = require("../db");
    const [affected] = await User.update(data, { where: { id } });
    if (affected === 0) return null;
    return User.findByPk(id, {
      attributes: ["id", "username", "email", "role"],
    });
  },

  // Xóa user theo id
  async deleteUser(id) {
    const { User } = require("../db");
    return User.destroy({ where: { id } });
  },
  // ... Thêm các hàm login, get User by role sau ...
};

module.exports = userService;
