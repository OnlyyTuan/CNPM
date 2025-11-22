// backend/src/services/userService.js
const bcrypt = require('bcryptjs');
const { sequelize, User, Driver } = require('../db'); // Import các models đã khởi tạo
const config = require('../config/app.config');

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
    // ... Thêm các hàm login, get User by role sau ...
};

module.exports = userService;