// backend/src/database.js
// Kết nối MySQL2 trực tiếp (không dùng Sequelize)

const mysql = require('mysql2/promise');
const dbConfig = require('./config/db.config');

// Tạo connection pool
const pool = mysql.createPool({
  host: dbConfig.HOST,
  user: dbConfig.USER,
  password: dbConfig.PASSWORD,
  database: dbConfig.DB,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: '+07:00',
  charset: 'utf8mb4',
});

// Test kết nối
pool.getConnection()
  .then(connection => {
    console.log('✅ Kết nối Database thành công!');
    connection.release();
  })
  .catch(err => {
    console.error('❌ Lỗi kết nối Database:', err.message);
  });

module.exports = pool;
