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

  // Feature flags (bật/tắt tính năng theo môi trường)
  FEATURE_FLAGS: {
    // Bật GPT-5 cho tất cả client (mặc định: true)
    GPT_5_ENABLED: (process.env.ENABLE_GPT_5 || 'true').toLowerCase() === 'true',
    // Tuỳ chọn: tên model để client hiển thị
    GPT_MODEL: process.env.GPT_MODEL || 'gpt-5',
  },
};

module.exports = config;
