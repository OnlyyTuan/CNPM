const mysql = require('mysql2/promise');
const dbConfig = require('./src/config/db.config');

async function testConnection() {
    try {
        const connection = await mysql.createConnection({
            host: dbConfig.HOST,
            user: dbConfig.USER,
            password: dbConfig.PASSWORD,
            database: dbConfig.DB
        });
        
        console.log('Kết nối thành công!');
        
        // Thử query
        const [rows] = await connection.execute('SELECT * FROM user LIMIT 1');
        console.log('Dữ liệu từ bảng user:', rows);
        
        await connection.end();
    } catch (error) {
        console.error('Lỗi kết nối:', error.message);
        console.error('Chi tiết lỗi:', error);
    }
}

testConnection();
