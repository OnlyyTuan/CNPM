const { Sequelize } = require("sequelize");
// Lấy cấu hình DB: ưu tiên process.env, nếu có file config thì merge (env override)
let dbConfig;
try {
  const cfg = require("./config/db.config");
  dbConfig = {
    HOST: process.env.DB_HOST || cfg.HOST || "127.0.0.1",
    USER: process.env.DB_USER || cfg.USER || "root",
    PASSWORD: process.env.DB_PASSWORD || cfg.PASSWORD || "",
    DB: process.env.DB_NAME || cfg.DB || "smartschoolbus",
    DIALECT: cfg.DIALECT || "mysql",
    PORT: process.env.DB_PORT ? Number(process.env.DB_PORT) : cfg.PORT || 3306,
    pool: cfg.pool || { max: 5, min: 0, acquire: 30000, idle: 10000 },
  };
} catch (err) {
  // Nếu không có file config, dựng từ env hoặc mặc định
  dbConfig = {
    HOST: process.env.DB_HOST || "127.0.0.1",
    USER: process.env.DB_USER || "root",
    PASSWORD: process.env.DB_PASSWORD || "",
    DB: process.env.DB_NAME || "smartschoolbus",
    DIALECT: "mysql",
    PORT: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    pool: { max: 5, min: 0, acquire: 30000, idle: 10000 },
  };
}
// ...existing code...

// Hiện thông tin kết nối (không in password)
console.log(
  `DB: connecting -> user=${dbConfig.USER} host=${dbConfig.HOST} port=${dbConfig.PORT} database=${dbConfig.DB}`
);

// 1. Khởi tạo Sequelize Instance
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.DIALECT,
  pool: dbConfig.pool,
  logging: false, // Tắt log truy vấn SQL
  // Thiết lập múi giờ mặc định cho Sequelize
  timezone: "+07:00",
  dialectOptions: {
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci'
  },
  // TẮT CACHE để luôn lấy dữ liệu mới từ DB
  benchmark: false,
  query: {
    raw: false
  }
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
db.RouteWaypoint = require("./models/RouteWaypoint")(sequelize, Sequelize.DataTypes);
db.Bus = require("./models/Bus")(sequelize, Sequelize.DataTypes);
db.Driver = require("./models/Driver")(sequelize, Sequelize.DataTypes);
db.Student = require("./models/Student")(sequelize, Sequelize.DataTypes);
db.Message = require("./models/Message")(sequelize, Sequelize.DataTypes);

// ===================================
// 3. THIẾT LẬP CÁC QUAN HỆ (ASSOCIATIONS)
// ===================================

// --- Message Associations ---
db.Message.belongsTo(db.User, { foreignKey: 'senderId', as: 'Sender' });
db.Message.belongsTo(db.User, { foreignKey: 'recipientId', as: 'Recipient' });

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
  foreignKey: "current_bus_id",
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

// Parent (1-N) Student
db.Parent.hasMany(db.Student, {
  foreignKey: "parent_id", // Khóa ngoại trong bảng student
  as: "Students", // Tên mảng mà parentService.js đang INCLUDE
  onDelete: "CASCADE",
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

// --- Route & RouteWaypoint (Lộ trình và các điểm trên lộ trình) ---
// Route (1-N) RouteWaypoint
db.Route.hasMany(db.RouteWaypoint, {
  foreignKey: "route_id",
  as: "Waypoints",
  onDelete: "CASCADE",
});
db.RouteWaypoint.belongsTo(db.Route, {
  foreignKey: "route_id",
  as: "Route",
});

// ===================================
// 4. HÀM KẾT NỐI VÀ ĐỒNG BỘ DB
// ===================================
db.connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Kết nối Database thành công!");
    
    await sequelize.sync({ force: false });
    console.log("✅ Đồng bộ hóa Models/Tables thành công.");
  } catch (error) {
    console.error("❌ LỖI Kết nối Database:", error);
    throw error;
  }
};

module.exports = db;