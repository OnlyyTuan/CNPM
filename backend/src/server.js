// backend/src/server.js
// File khởi động server đơn giản (không dùng Sequelize)

const app = require('./app');
const db = require('./database');
const config = require('./config/app.config');

async function startServer() {
    console.log('--- SmartSchoolBus Backend Server ---');
    
    try {
        // Test kết nối database
        await db.query('SELECT 1');
        console.log('✅ Kết nối Database thành công!');

        // Khởi động server
        const PORT = config.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`🚀 Server đang chạy: http://localhost:${PORT}`);
            console.log(`📊 API Endpoints:`);
            console.log(`   - Dashboard: http://localhost:${PORT}/api/v1/dashboard`);
            console.log(`   - Students: http://localhost:${PORT}/api/v1/students`);
            console.log(`   - Drivers: http://localhost:${PORT}/api/v1/drivers`);
            console.log(`   - Buses: http://localhost:${PORT}/api/v1/buses`);
            console.log(`   - Schedules: http://localhost:${PORT}/api/v1/schedules`);
            console.log(`   - Assignments: http://localhost:${PORT}/api/v1/assignments`);
        });
    } catch (error) {
        console.error('❌ Lỗi khi khởi động server:', error.message);
        process.exit(1);
    }
}

startServer();
