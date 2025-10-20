// backend/src/config/app.config.js
require("dotenv").config();
// Lấy biến môi trường, hoặc dùng giá trị mặc định nếu không có
// Nên sử dụng thư viện dotenv nếu muốn lưu các biến này vào file .env
const config = {
  // Cổng chạy server, mặc định là 5000
  PORT: process.env.PORT || 5000,

  // Mã bí mật dùng cho JSON Web Token (JWT) trong xác thực (Authentication)
  JWT_SECRET: process.env.JWT_SECRET || "smart-school-bus-secret-key",

  // Số lần băm mật khẩu (dùng cho bcrypt)
  SALT_ROUNDS: 10,

  // Thời gian hết hạn của token (ví dụ: 1 giờ)
  TOKEN_EXPIRATION: "1h",
};

module.exports = config;
