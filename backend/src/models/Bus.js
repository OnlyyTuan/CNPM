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
      capacity: {
        type: DataTypes.INTEGER,
      },
      currentLocationId: {
        type: DataTypes.STRING(255),
      },
      status: {
        type: DataTypes.STRING(50),
      },
      speed: {
        type: DataTypes.DECIMAL(5, 2),
      },
      licensePlate: {
        type: DataTypes.STRING(20),
        unique: true,
      },
      routeId: {
        type: DataTypes.STRING(255),
      },
      driverId: {
        type: DataTypes.STRING(255),
        unique: true,
      },
    },
    {
      tableName: "bus",
      timestamps: false,
      underscored: true,
    }
  );
  return Bus;
};
