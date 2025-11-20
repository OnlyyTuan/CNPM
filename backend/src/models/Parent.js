// backend/src/models/Parent.js
module.exports = (sequelize, DataTypes) => {
  const Parent = sequelize.define(
    "Parent",
    {
      // Dùng 'Parent' hoa cho tên Model
      id: {
        type: DataTypes.STRING(255),
        primaryKey: true,
        allowNull: false,
      },
      fullName: {
        type: DataTypes.STRING(100),
        field: "full_name", // Ánh xạ tới cột SQL
      },
      phone: {
        type: DataTypes.STRING(20),
      },
      address: {
        // Thêm thuộc tính address
        type: DataTypes.STRING(255),
      },
      userId: {
        // Thêm userId (camelCase)
        type: DataTypes.STRING(255),
        unique: true,
      },
    },
    {
      tableName: "parent", // Đã sửa sang chữ thường
      timestamps: false,
      underscored: true, // Giúp gọn gàng output JSON
    }
  );

  return Parent;
};
