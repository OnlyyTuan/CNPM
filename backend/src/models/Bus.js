// backend/src/models/Bus.js
module.exports = (sequelize, DataTypes) => {
  const Bus = sequelize.define(
    "Bus",
    {
      id: {
        type: DataTypes.STRING(255),
        primaryKey: true,
        allowNull: false,
      },
      capacity: { type: DataTypes.INTEGER },
      current_location_id: { type: DataTypes.STRING(255) }, // Khóa ngoại Location
      status: { type: DataTypes.STRING(50) },
      speed: { type: DataTypes.DECIMAL(5, 2) },
      //lastUpdate: { type: DataTypes.DATE }, // TIMESTAMP trong SQL, dùng DATE
      license_plate: {
        type: DataTypes.STRING(20),
        unique: true,
      },
      route_id: { type: DataTypes.STRING(255) }, // Khóa ngoại Route (Admin 2)
      driver_id: {
        // UNIQUE Constraint
        type: DataTypes.STRING(255),
        unique: true, // Quan trọng: Đảm bảo 1 xe chỉ có 1 tài xế
      },
    },
    {
      tableName: "bus",
      timestamps: false, // Bảng Bus không có cột created_at/updated_at trong SQL
    }
  );
  return Bus;
};
