#!/usr/bin/env node
// backend/scripts/import_db_node.js
// Import SQL dump using mysql2 (no external mysql CLI required)

const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });
const mysql = require("mysql2/promise");

async function run() {
  const DB_HOST = process.env.DB_HOST || "localhost";
  const DB_USER = process.env.DB_USER || "root";
  const DB_PASSWORD = process.env.DB_PASSWORD || "";
  const DB_NAME = process.env.DB_NAME || "smartschoolbus";
  const DB_PORT = process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306;

  const sqlPath = path.resolve(
    __dirname,
    "..",
    "..",
    "database",
    "smartschoolbus_backup.sql"
  );
  if (!fs.existsSync(sqlPath)) {
    console.error("SQL file not found:", sqlPath);
    process.exit(1);
  }

  const sql = fs.readFileSync(sqlPath, "utf8");

  console.log("Connecting to MySQL", {
    host: DB_HOST,
    user: DB_USER,
    database: DB_NAME,
    port: DB_PORT,
  });
  const conn = await mysql.createConnection({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    port: DB_PORT,
    multipleStatements: true,
    charset: "utf8mb4",
  });

  try {
    // Try to create database if not exists
    await conn.query(
      `CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
    );
    await conn.changeUser({ database: DB_NAME });

    console.log("Importing SQL... (this may take a few seconds)");
    await conn.query(sql);
    console.log("✅ Import completed successfully");
  } catch (err) {
    console.error("❌ Import failed:", err.message);
    process.exit(1);
  } finally {
    await conn.end();
  }
}

run().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
