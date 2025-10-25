// backend/src/models/Route.js
module.exports = (sequelize, DataTypes) => {
    const Route = sequelize.define('Route', {
        id: {
            type: DataTypes.STRING(255),
            primaryKey: true,
            allowNull: false,
        },
        routeName: {
            type: DataTypes.STRING(100),
            field: 'route_name',
            allowNull: false,
        },
        estimatedDuration: {
            type: DataTypes.INTEGER,
            field: 'estimated_duration',
        },
        distance: {
            type: DataTypes.DECIMAL(10, 2),
        },
    }, {
        tableName: 'route',
        timestamps: false,
        underscored: true,
    });
    return Route;
};