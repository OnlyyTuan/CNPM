// backend/src/models/Schedule.js
// Model cho bảng Lịch trình xe buýt

module.exports = (sequelize, DataTypes) => {
  const Schedule = sequelize.define(
    "Schedule",
    {
      id: {
        type: DataTypes.STRING(255),
        primaryKey: true,
        allowNull: false,
      },
      busId: {
        type: DataTypes.STRING(255),
        allowNull: false,
        references: {
          model: 'bus',
          key: 'id'
        }
      },
      routeId: {
        type: DataTypes.STRING(255),
        allowNull: false,
        references: {
          model: 'route',
          key: 'id'
        }
      },
      startTime: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      endTime: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('PLANNED', 'ONGOING', 'COMPLETED', 'CANCELED'),
        defaultValue: 'PLANNED',
      },
    },
    {
      tableName: "schedule",
      timestamps: false, // Không sử dụng createdAt và updatedAt
      underscored: true,
    }
  );

  return Schedule;
};
