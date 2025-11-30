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
  timezone: "+07:00",
  dialectOptions: {
    charset: "utf8mb4",
  },
  define: {
    charset: "utf8mb4",
    collate: "utf8mb4_unicode_ci",
  },
  benchmark: false,
  query: {
    raw: false,
  },
});

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// ===================================
// ĐỊNH NGHĨA VÀ KHỞI TẠO MODELS
// ===================================
db.User = require("./models/User")(sequelize, Sequelize.DataTypes);
db.Parent = require("./models/Parent")(sequelize, Sequelize.DataTypes);
db.Location = require("./models/Location")(sequelize, Sequelize.DataTypes);
db.Route = require("./models/Route")(sequelize, Sequelize.DataTypes);
db.RouteWaypoint = require("./models/RouteWaypoint")(sequelize, Sequelize.DataTypes);
db.Bus = require("./models/Bus")(sequelize, Sequelize.DataTypes);
db.Driver = require("./models/Driver")(sequelize, Sequelize.DataTypes);
db.Student = require("./models/Student")(sequelize, Sequelize.DataTypes);
db.ChatMessage = require("./models/ChatMessage")(sequelize, Sequelize.DataTypes);
db.Notification = require("./models/Notification")(sequelize, Sequelize.DataTypes);

// ===================================
// ASSOCIATIONS
// ===================================
db.User.hasOne(db.Parent, { foreignKey: "user_id", onDelete: "CASCADE", as: "ParentProfile" });
db.Parent.belongsTo(db.User, { foreignKey: "user_id", as: "UserAccount" });

db.User.hasOne(db.Driver, { foreignKey: "user_id", onDelete: "CASCADE", as: "DriverProfile" });
db.Driver.belongsTo(db.User, { foreignKey: "user_id", as: "UserAccount" });

db.Driver.belongsTo(db.Bus, { foreignKey: "current_bus_id", as: "CurrentBus", onDelete: "SET NULL" });
db.Bus.belongsTo(db.Driver, { foreignKey: "driver_id", as: "CurrentDriver", onDelete: "SET NULL" });

db.Bus.belongsTo(db.Location, { foreignKey: "current_location_id", as: "CurrentLocation", onDelete: "SET NULL" });
db.Bus.belongsTo(db.Route, { foreignKey: "route_id", as: "CurrentRoute", onDelete: "SET NULL" });

db.Student.belongsTo(db.Bus, { foreignKey: "assigned_bus_id", as: "AssignedBus" });
db.Parent.hasMany(db.Student, { foreignKey: "parent_id", as: "Students", onDelete: "CASCADE" });
db.Student.belongsTo(db.Parent, { foreignKey: "parent_id", as: "Parent", onDelete: "CASCADE" });
db.Student.belongsTo(db.Location, { foreignKey: "pickup_location_id", as: "PickupLocation" });
db.Student.belongsTo(db.Location, { foreignKey: "dropoff_location_id", as: "DropoffLocation" });

db.ChatMessage.belongsTo(db.User, { foreignKey: "sender_id", as: "Sender", onDelete: "CASCADE" });
db.ChatMessage.belongsTo(db.User, { foreignKey: "receiver_id", as: "Receiver", onDelete: "CASCADE" });

db.User.hasMany(db.Notification, { foreignKey: "user_id", as: "Notifications", onDelete: "CASCADE" });
db.Notification.belongsTo(db.User, { foreignKey: "user_id", as: "User" });

db.Route.hasMany(db.RouteWaypoint, { foreignKey: "route_id", as: "Waypoints", onDelete: "CASCADE" });
db.RouteWaypoint.belongsTo(db.Route, { foreignKey: "route_id", as: "Route" });

// ===================================
// Hàm kết nối DB
// ===================================
db.connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Kết nối Database thành công!");

    if (process.env.DB_AUTO_MIGRATE && process.env.DB_AUTO_MIGRATE.toLowerCase() === 'true') {
      console.log('⚠️ DB_AUTO_MIGRATE=true -> running sequelize.sync({ alter: true }) to migrate models (development only)');
      try {
        await sequelize.sync({ alter: true });
        console.log('✅ Database models synchronized (alter).');
      } catch (syncErr) {
        console.error('❌ Failed to auto-migrate database models:', syncErr);
      }
    } else {
      console.log("✅ Sử dụng database có sẵn (không sync).");
    }
  } catch (error) {
    console.error("❌ LỖI Kết nối Database:", error);
    throw error;
  }
};

module.exports = db;
