// backend/src/models/Driver.js
module.exports = (sequelize, DataTypes) => {
  const Driver = sequelize.define(
    "Driver",
    {
      id: { 
        type: DataTypes.STRING(255), 
        primaryKey: true, 
        allowNull: false 
      },
      fullName: { 
        type: DataTypes.STRING(255),
        field: 'full_name' // Ánh xạ: fullName -> full_name
      },
      phone: { type: DataTypes.STRING(20) },
      licenseNumber: { 
        type: DataTypes.STRING(50),
        unique: true,
        field: "license_number", // Ánh xạ: licenseNumber -> license_number
      },
      status: { type: DataTypes.STRING(50) },
      currentBusId: { // Khóa ngoại, dùng camelCase
        type: DataTypes.STRING(255),
        field: 'currentBus_id' // Ánh xạ: currentBusId -> currentBus_id
      }, 
      userId: { // Khóa ngoại, dùng camelCase
        type: DataTypes.STRING(255), 
        unique: true,
        field: 'user_id' // Ánh xạ: userId -> user_id
      }
    },
    {
      tableName: "driver",
      timestamps: false,
      // Thêm option này để chỉ hiển thị thuộc tính camelCase đã được ánh xạ,
      // loại bỏ các cột snake_case cũ ra khỏi JSON output (Giúp gọn gàng)
      underscored: true, 
    }
  );
  return Driver;
};