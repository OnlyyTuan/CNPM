// backend/src/index.js (Điểm khởi động chính)
require("dotenv").config(); // Load biến môi trường từ .env
const app = require("./app"); // Express App
const db = require("./db"); // Kết nối Database
const config = require("./config/app.config"); // Cấu hình chung

// Hàm chính để khởi động ứng dụng
async function startServer() {
  console.log("--- Đồ án SmartSchoolBus 1.0 Backend ---");
  try {
    // <<< THÊM TRY
    // 1. Kết nối Database
    await db.connectDB(); // Hàm này phải đảm bảo trả về lỗi nếu kết nối thất bại // 2. Lắng nghe Server

    const PORT = config.PORT;
    app.listen(PORT, () => {
      console.log(`🚀 Server đang chạy trên cổng: http://localhost:${PORT}`);
    });
  } catch (error) {
    // <<< THÊM CATCH
    console.error(
      "🚨 Lỗi nghiêm trọng khi khởi động Server hoặc Kết nối DB:",
      error.message
    ); // Thoát ứng dụng nếu DB không kết nối được
    process.exit(1);
  }
}

// Chạy hàm khởi động
startServer();

// Bắt unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Bắt uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('🚨 Uncaught Exception:', error);
  process.exit(1);
});
