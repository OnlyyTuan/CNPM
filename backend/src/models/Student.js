// backend/src/models/Student.js
module.exports = (sequelize, DataTypes) => {
  const Student = sequelize.define(
    "Student",
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        // SỬA: field: 'full_name' nếu cột SQL là full_name
        type: DataTypes.STRING,
        field: "full_name", // Giả sử cột SQL là 'full_name'
        allowNull: false,
      },
      className: {
        type: DataTypes.STRING,
        field: "class", // Ánh xạ className (JS) -> class (SQL)
      },
      grade: {
        type: DataTypes.STRING,
      },
      parentContact: {
        type: DataTypes.STRING,
        field: "parent_contact", // Ánh xạ parentContact (JS) -> parent_contact (SQL)
      },
      status: {
        type: DataTypes.ENUM("IN_BUS", "WAITING", "ABSENT"),
        defaultValue: "WAITING",
      },
      // Khóa ngoại dạng camelCase (underscored: true sẽ ánh xạ sang snake_case trong DB)
      assignedBusId: { type: DataTypes.STRING }, // Ánh xạ tới assigned_bus_id
      parentId: { type: DataTypes.STRING }, // Ánh xạ tới parent_id
      pickupLocationId: { type: DataTypes.STRING }, // Ánh xạ tới pickup_location_id
      dropoffLocationId: { type: DataTypes.STRING }, // Ánh xạ tới dropoff_location_id
    },
    {
      tableName: "student", // Đổi tên bảng thành 'student' (viết thường)
      timestamps: false,
      underscored: true, // Kích hoạt ánh xạ tự động
    }
  );

  return Student;
};
