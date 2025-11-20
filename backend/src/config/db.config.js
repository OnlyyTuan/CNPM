// backend/src/config/db.config.js

const config = {
    HOST: process.env.DB_HOST || "localhost",      // Địa chỉ máy chủ CSDL
    USER: process.env.DB_USER || "root",          // Tên người dùng CSDL
    PASSWORD: process.env.DB_PASSWORD || "",      // Thử với mật khẩu cũ
    DB: process.env.DB_NAME || "smartschoolbus",  // Tên Database đã tạo
    DIALECT: "mysql",                             // Loại CSDL
    pool: {
        max: 5,                                   // Số kết nối tối đa
        min: 0,                                   // Số kết nối tối thiểu
        acquire: 30000,                           // Thời gian chờ kết nối (ms)
        idle: 10000                               // Thời gian kết nối nhàn rỗi (ms)
    }
};

module.exports = config;
