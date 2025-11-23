#!/usr/bin/env node
// backend/scripts/ensure_driver1.js
// Ensure a minimal `user` table exists and insert driver1 if missing

const mysql = require("mysql2/promise");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });

async function run() {
  const DB_HOST = process.env.DB_HOST || "localhost";
  const DB_USER = process.env.DB_USER || "root";
  const DB_PASSWORD = process.env.DB_PASSWORD || "";
  const DB_NAME = process.env.DB_NAME || "smartschoolbus";
  const DB_PORT = process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306;

  const conn = await mysql.createConnection({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    port: DB_PORT,
    multipleStatements: true,
  });
  try {
    await conn.query(
      `CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
    );
    await conn.changeUser({ database: DB_NAME });

    // Check if user table exists
    const [tables] = await conn.query("SHOW TABLES LIKE 'user'");
    if (tables.length === 0) {
      console.log("🔧 Bảng `user` không tồn tại, tạo bảng tối giản...");
      await conn.query(`
        CREATE TABLE \`user\` (
          id VARCHAR(255) PRIMARY KEY,
          username VARCHAR(50) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE,
          role VARCHAR(50) NOT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);
      console.log("✅ Tạo bảng `user` thành công");
    } else {
      console.log("ℹ️ Bảng `user` đã tồn tại");
    }

    // Check if driver1 exists
    const [rows] = await conn.query("SELECT * FROM `user` WHERE username = ?", [
      "driver1",
    ]);
    if (rows.length === 0) {
      console.log("➡️ Chèn người dùng `driver1` với mật khẩu `123456`");
      await conn.query(
        "INSERT INTO `user` (id, username, password, email, role) VALUES (?, ?, ?, ?, ?)",
        ["U002", "driver1", "123456", "driver1@school.com", "driver"]
      );
      console.log("✅ driver1 đã được chèn vào DB");
    } else {
      console.log("ℹ️ driver1 đã tồn tại trong DB");
    }

    process.exit(0);
  } catch (err) {
    console.error("❌ Lỗi:", err.message);
    process.exit(1);
  } finally {
    await conn.end();
  }
}

run();
