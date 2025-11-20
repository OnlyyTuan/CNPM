// backend/src/models/Driver.js
module.exports = (sequelize, DataTypes) => {
  const Driver = sequelize.define(
    "Driver",
    {
      id: {
        type: DataTypes.STRING(255),
        primaryKey: true,
        allowNull: false,
      },
      fullName: {
        type: DataTypes.STRING(255),
        field: "full_name",
        allowNull: false,
      },
      phone: { type: DataTypes.STRING(20) },
      licenseNumber: {
        type: DataTypes.STRING(50),
        unique: true,
        field: "license_number", // GIỮ LẠI
      },
      status: { type: DataTypes.STRING(50) },
      current_bus_id: {
        type: DataTypes.STRING(255),
      },
      userId: {
        // Khóa ngoại, dùng camelCase
        type: DataTypes.STRING(255),
        unique: true,
      },
    },
    {
      tableName: "driver",
      timestamps: false,
      underscored: true, // Kích hoạt ánh xạ tự động camelCase -> snake_case
    }
  );
  return Driver;
};
