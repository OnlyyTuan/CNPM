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
    }
    // ... Thêm các hàm login, get User by role sau ...
};

module.exports = userService;