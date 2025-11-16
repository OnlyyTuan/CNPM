// backend/src/index.js (Điểm khởi động chính)
require("dotenv").config(); // Load biến môi trường từ .env
const http = require('http');
const { Server } = require('socket.io');
const app = require("./app"); // Express App
const db = require("./db"); // Kết nối Database
const config = require("./config/app.config"); // Cấu hình chung
const { initializeSocket } = require("./socketManager"); // Import trình quản lý socket

// Tạo HTTP server và Socket.IO server
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Cho phép tất cả các origin, trong thực tế nên giới hạn lại
    methods: ["GET", "POST"]
  }
});

// Khởi tạo các xử lý cho socket
initializeSocket(io);

// Hàm chính để khởi động ứng dụng
async function startServer() {
  console.log("--- Đồ án SmartSchoolBus 1.0 Backend ---");
  try {
    // 1. Kết nối Database
    await db.connectDB();

    // 2. Lắng nghe Server
    const PORT = config.PORT;
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server đang chạy trên cổng: http://localhost:${PORT}`);
      console.log(`🔌 Socket.IO server is ready.`);
    });
  } catch (error) {
    console.error(
      "🚨 Lỗi nghiêm trọng khi khởi động Server hoặc Kết nối DB:",
      error.message
    );
    process.exit(1);
  }
}

// Chạy hàm khởi động
startServer();