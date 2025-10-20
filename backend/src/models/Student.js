// backend/src/models/Student.js

module.exports = (sequelize, DataTypes) => {
  const Student = sequelize.define(
    "Student",
    {
      id: {
        type: DataTypes.STRING(255),
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: "full_name",
      },
      className: {
        // Thuộc tính dữ liệu
        type: DataTypes.STRING(50),
        field: "class",
      },
      grade: {
        type: DataTypes.STRING(20),
      },
      parentContact: {
        // Thuộc tính dữ liệu
        type: DataTypes.STRING(20),
        field: "parent_contact",
      },
      status: {
        type: DataTypes.ENUM("IN_BUS", "WAITING", "ABSENT"),
        defaultValue: "WAITING",
      },

      // Sequelize sẽ tự động thêm các cột này dựa trên db.js
    },
    {
      tableName: "student",
      timestamps: false,
      underscored: true,
    }
  );

  // Tuy nhiên, để Sequelize trả về tên thuộc tính camelCase cho các FK này,
  // chúng ta sẽ phải dùng alias trong Association.
  return Student;
};
