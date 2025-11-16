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
      fullName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      className: {
        type: DataTypes.STRING,
      },
      grade: {
        type: DataTypes.STRING,
      },
      parentContact: {
        type: DataTypes.STRING,
      },
      status: {
        type: DataTypes.ENUM("IN_BUS", "WAITING", "ABSENT"),
        defaultValue: "WAITING",
      },
      assignedBusId: { 
        type: DataTypes.STRING 
      },
      parentId: { 
        type: DataTypes.STRING 
      },
      pickupLocationId: { 
        type: DataTypes.STRING 
      },
      dropoffLocationId: { 
        type: DataTypes.STRING 
      },
    },
    {
      tableName: "student", // Đổi tên bảng thành 'student' (viết thường)
      timestamps: false,
      underscored: true, // Kích hoạt ánh xạ tự động
    }
  );

  return Student;
};
