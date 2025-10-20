// backend/src/models/Route.js
module.exports = (sequelize, DataTypes) => {
    const Route = sequelize.define('Route', {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
            allowNull: false,
        },
        route_name: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        estimatedDuration: {
            type: DataTypes.STRING,
        },
        distance: {
            type: DataTypes.DECIMAL(10, 2),
        },
    }, { 
        tableName: 'route', 
        timestamps: false, 
    });
    return Route;
};