const mysql = require("mysql2/promise");

async function checkDrivers() {
  try {
    const connection = await mysql.createConnection({
      host: "127.0.0.1",
      user: "root",
      password: "thinh2014",
      database: "smartschoolbus",
    });

    console.log("✅ Kết nối database thành công!\n");

    // Kiểm tra tất cả tài xế
    const [drivers] = await connection.execute("SELECT * FROM driver");
    console.log("📋 Danh sách tài xế hiện tại:");
    console.table(drivers);

    // Kiểm tra tất cả user role driver
    const [users] = await connection.execute(
      "SELECT * FROM user WHERE role='driver'"
    );
    console.log("\n📋 Danh sách user role=driver:");
    console.table(users);

    await connection.end();
  } catch (error) {
    console.error("❌ Lỗi:", error.message);
  }
}

checkDrivers();
