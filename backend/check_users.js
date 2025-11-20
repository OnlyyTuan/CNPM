const mysql = require('mysql2/promise');
const dbConfig = require('./src/config/db.config');

async function checkUsers() {
    try {
        const connection = await mysql.createConnection({
            host: dbConfig.HOST,
            user: dbConfig.USER,
            password: dbConfig.PASSWORD,
            database: dbConfig.DB
        });
        
        console.log('Kết nối thành công!');
        
        // Lấy tất cả tài khoản user
        const [users] = await connection.execute('SELECT username, password, role FROM user');
        console.log('Danh sách tài khoản:', users);
        
        await connection.end();
    } catch (error) {
        console.error('Lỗi:', error.message);
    }
}

checkUsers();