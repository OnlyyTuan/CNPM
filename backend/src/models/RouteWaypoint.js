// backend/src/models/RouteWaypoint.js
module.exports = (sequelize, DataTypes) => {
  const RouteWaypoint = sequelize.define('RouteWaypoint', {
    id: {
      type: DataTypes.STRING(255),
      primaryKey: true,
      allowNull: false,
    },
    route_id: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'route_id',
    },
    sequence: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 6),
      allowNull: false,
    },
    longitude: {
      type: DataTypes.DECIMAL(10, 6),
      allowNull: false,
    },
    stop_name: {
      type: DataTypes.STRING(255),
      field: 'stop_name',
    },
    is_stop: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_stop',
    },
  }, {
    tableName: 'route_waypoint',
    timestamps: false,
  });
  
  return RouteWaypoint;
};
