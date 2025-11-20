// backend/src/models/Location.js
module.exports = (sequelize, DataTypes) => {
    const Location = sequelize.define('Location', {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING,
        },
        address: {
            type: DataTypes.STRING,
        },
        latitude: {
            type: DataTypes.DECIMAL(10, 8),
        },
        longitude: {
            type: DataTypes.DECIMAL(11, 8),
        },
        type: {
            type: DataTypes.STRING,
        },
    }, { 
        tableName: 'Location', 
        timestamps: false, 
    });
    return Location;
};