// backend/src/services/userService.js
const bcrypt = require("bcryptjs");
const { sequelize, User, Driver } = require("../db"); // Import các models đã khởi tạo
const config = require("../config/app.config");

const userService = {
    /** Tạo tài khoản User và hồ sơ Driver trong cùng 1 Transaction */
    async createDriverAndUser(userData, driverData) {
        // Bắt đầu Transaction
        const t = await sequelize.transaction(); 
        try {
            // 1. Băm mật khẩu
            const hashedPassword = await bcrypt.hash(userData.password, config.SALT_ROUNDS);

            // 2. Tạo bản ghi User (role: DRIVER)
            const newUser = await User.create({
                ...userData,
                password: hashedPassword,
                role: 'DRIVER'
            }, { transaction: t });

            // 3. Tạo bản ghi Driver, liên kết với ID của User
            await Driver.create({
                id: newUser.id, // Sử dụng ID của User làm ID của Driver
                ...driverData
            }, { transaction: t });

            // Commit Transaction nếu cả hai bước thành công
            await t.commit(); 
            return { user: newUser, driver: true };

        } catch (error) {
            // Rollback nếu có lỗi xảy ra
            await t.rollback(); 
            throw error; 
        }
    },

    /** Lấy người dùng quản trị đầu tiên */
    async getFirstAdmin() {
        try {
            // Ưu tiên tìm admin có ID cụ thể 'U001'
            let admin = await User.findOne({
                where: { id: 'U001', role: 'admin' },
                attributes: ['id', 'username', 'email', 'role'],
            });

            // Nếu không tìm thấy 'U001', tìm admin bất kỳ và sắp xếp để đảm bảo tính nhất quán
            if (!admin) {
                admin = await User.findOne({
                    where: { role: 'admin' },
                    attributes: ['id', 'username', 'email', 'role'],
                    order: [['username', 'ASC']], // Sắp xếp theo username để kết quả nhất quán
                });
            }

            return admin;
        } catch (error) {
            throw error;
        }
    },

    /** Lấy tất cả users có thể chat (drivers và parents) */
    async getChatUsers() {
        try {
            const users = await User.findAll({
                where: {
                    role: ['driver', 'parent']
                },
                attributes: ['id', 'username', 'email', 'role'],
                order: [['role', 'ASC'], ['username', 'ASC']],
            });
            return users;
        } catch (error) {
            throw error;
        }
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
