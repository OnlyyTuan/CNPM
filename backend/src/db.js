// backend/src/db.js

const { Sequelize } = require("sequelize");
const dbConfig = require("./config/db.config"); // Lấy cấu hình DB

// 1. Khởi tạo Sequelize Instance
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.DIALECT,
  pool: dbConfig.pool,
  logging: false, // Tắt log truy vấn SQL
  // Thiết lập múi giờ mặc định cho Sequelize
  timezone: "+07:00",
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// ===================================
// 2. ĐỊNH NGHĨA VÀ KHỞI TẠO MODELS
// (CHỈ GIỮ LẠI CÁC MODEL CẦN THIẾT)
// ===================================
db.User = require("./models/User")(sequelize, Sequelize.DataTypes);
db.Parent = require("./models/Parent")(sequelize, Sequelize.DataTypes);
db.Location = require("./models/Location")(sequelize, Sequelize.DataTypes);
db.Route = require("./models/Route")(sequelize, Sequelize.DataTypes);
db.Bus = require("./models/Bus")(sequelize, Sequelize.DataTypes);
db.Driver = require("./models/Driver")(sequelize, Sequelize.DataTypes);
db.Student = require("./models/Student")(sequelize, Sequelize.DataTypes);

// ===================================
// 3. THIẾT LẬP CÁC QUAN HỆ (ASSOCIATIONS)
// ===================================

// --- User & Vai trò (Parent/Driver) ---
db.User.hasOne(db.Parent, {
  foreignKey: "user_id",
  onDelete: "CASCADE",
  as: "ParentProfile",
});
db.Parent.belongsTo(db.User, { foreignKey: "user_id", as: "UserAccount" });

db.User.hasOne(db.Driver, {
  foreignKey: "user_id",
  onDelete: "CASCADE",
  as: "DriverProfile",
});
db.Driver.belongsTo(db.User, { foreignKey: "user_id", as: "UserAccount" });

// --- Bus & Driver (Quan hệ 1-1, hai chiều) ---
// 1. Driver biết đang lái xe nào
db.Driver.belongsTo(db.Bus, {
  foreignKey: "currentBus_id",
  as: "CurrentBus",
  onDelete: "SET NULL",
});
// 2. Bus biết ai đang lái xe mình
db.Bus.belongsTo(db.Driver, {
  foreignKey: "driver_id",
  as: "CurrentDriver",
  onDelete: "SET NULL",
});

// --- Bus & Location/Route (ĐÃ BỎ COMMENT VÀ GIỮ LẠI) ---
// Bus (N-1) Location (Vị trí hiện tại)
db.Bus.belongsTo(db.Location, {
  foreignKey: "current_location_id", // <<< PHẢI DÙNG DẤU GẠCH DƯỚI
  as: "CurrentLocation",
  onDelete: "SET NULL",
});
// Bus (N-1) Route (Tuyến đường đang chạy)
db.Bus.belongsTo(db.Route, {
  foreignKey: "route_id",
  as: "CurrentRoute",
  onDelete: "SET NULL",
});

// --- Student & Phụ thuộc ---
// Student (N-1) Bus
db.Student.belongsTo(db.Bus, {
  foreignKey: "assigned_bus_id",
  as: "AssignedBus",
  //onDelete: "SET NULL",
});
// Student (N-1) Parent
db.Student.belongsTo(db.Parent, {
  foreignKey: "parent_id",
  as: "Parent",
  onDelete: "CASCADE",
});
// Student (N-1) Location (Điểm đón & Điểm trả - ĐÃ BỎ COMMENT VÀ GIỮ LẠI)
db.Student.belongsTo(db.Location, {
  foreignKey: "pickup_location_id",
  as: "PickupLocation",
  // onDelete: "RESTRICT",
});
db.Student.belongsTo(db.Location, {
  foreignKey: "dropoff_location_id",
  as: "DropoffLocation",
  // onDelete: "RESTRICT",
});

// ===================================
// 4. HÀM KẾT NỐI VÀ ĐỒNG BỘ DB
// ===================================
db.connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Kết nối Database thành công!");

    // Đồng bộ hóa các Models với DB (Tạo/Update bảng nếu cần)
    await sequelize.sync({ force: false });
    console.log("✅ Đồng bộ hóa Models/Tables thành công.");
  } catch (error) {
    console.error("❌ LỖI Kết nối Database:", error);
    throw error;
  }
};

module.exports = db;
