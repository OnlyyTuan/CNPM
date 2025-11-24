#!/usr/bin/env node
// backend/scripts/import_db.js
// Script đơn giản để import `database/smartschoolbus_backup.sql` vào MySQL
// Sử dụng các biến môi trường trong .env (sử dụng dotenv)

const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });

const DB_HOST = process.env.DB_HOST || "localhost";
const DB_USER = process.env.DB_USER || "root";
const DB_PASSWORD = process.env.DB_PASSWORD || "";
const DB_NAME = process.env.DB_NAME || "smartschoolbus";
const DB_PORT = process.env.DB_PORT || "3306";

const sqlFile = path.resolve(
  __dirname,
  "..",
  "..",
  "database",
  "smartschoolbus_backup.sql"
);

if (!fs.existsSync(sqlFile)) {
  console.error("❌ Không tìm thấy file SQL:", sqlFile);
  process.exit(1);
}

console.log("ℹ️ Sử dụng cấu hình DB từ .env:", {
  DB_HOST,
  DB_USER,
  DB_NAME,
  DB_PORT,
});

// Kiểm tra sự tồn tại của mysql CLI
const which = process.platform === "win32" ? "where" : "which";
const whichProc = spawn(which, ["mysql"], { stdio: "ignore" });

whichProc.on("exit", (code) => {
  if (code !== 0) {
    console.error(
      "\n❌ mysql CLI không tìm thấy trên PATH. Vui lòng cài MySQL client hoặc dùng công cụ quản lý DB (MySQL Workbench) để import file SQL."
    );
    console.error(
      "Trên Windows, cài MySQL installer hoặc đảm bảo folder chứa mysql.exe có trong PATH."
    );
    process.exit(1);
  }

  // Chuẩn bị args cho mysql
  const args = [
    "-h",
    DB_HOST,
    "-P",
    DB_PORT,
    "-u",
    DB_USER,
    "--default-character-set=utf8mb4",
    DB_NAME,
  ];

  // Nếu có mật khẩu, truyền dưới dạng biến môi trường MYSQL_PWD để tránh hiển thị trên commandline
  const env = Object.assign({}, process.env);
  if (DB_PASSWORD && DB_PASSWORD.length > 0) {
    env.MYSQL_PWD = DB_PASSWORD;
  }

  console.log("➡️ Bắt đầu import file SQL vào database", DB_NAME);
  const mysql = spawn("mysql", args, { env });

  const rs = fs.createReadStream(sqlFile);
  rs.pipe(mysql.stdin);

  mysql.stdout.on("data", (d) => process.stdout.write(d));
  mysql.stderr.on("data", (d) => process.stderr.write(d));

  mysql.on("close", (code) => {
    if (code === 0) {
      console.log("\n✅ Import SQL hoàn tất.");
    } else {
      console.error("\n❌ Import thất bại với mã:", code);
    }
    process.exit(code === 0 ? 0 : 1);
  });
});
